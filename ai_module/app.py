import logging
logging.basicConfig(level=logging.INFO)
from flask import Flask, request, jsonify
from predict import classify_and_prioritize
import os
from PIL import Image, UnidentifiedImageError

app = Flask(__name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE_MB = 10
UPLOAD_FOLDER = "ai_module/temp_uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "AI module running"})

@app.route("/photo", methods=["POST"])
def analyze_photo():
    # Check a file was actually sent
    if "photo" not in request.files:
        return jsonify({"error": "No file provided. Send as form-data with key 'photo'."}), 400

    file = request.files["photo"]

    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only jpg, jpeg, png allowed."}), 400

    # Save temporarily so PIL/torch can open it
    temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(temp_path)

    # Check file size after saving
    file_size_mb = os.path.getsize(temp_path) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        os.remove(temp_path)
        return jsonify({"error": f"File too large. Max {MAX_FILE_SIZE_MB}MB."}), 400

    try:
        # Verify it's actually a valid image (not just a renamed file)
        Image.open(temp_path).verify()

        result = classify_and_prioritize(temp_path)
        logging.info(f"Processed {file.filename}: {result}")
        os.remove(temp_path)
        return jsonify(result), 200

    except UnidentifiedImageError:
        os.remove(temp_path)
        return jsonify({"error": "File is not a valid image."}), 400

    except Exception as e:
        os.remove(temp_path)
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)