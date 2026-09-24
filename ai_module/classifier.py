from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

print("Loading CLIP model...")

model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32"
)

print("Model downloaded successfully.")

print("Loading processor...")

processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32"
)

print("CLIP model loaded successfully.")

image_path = image_path = image_path = image_path = image_path = image_path =image_path = "data/train/ac/ac_001.jpeg"

try:
    image = Image.open(image_path).convert("RGB")
    print("Image loaded successfully.")

except FileNotFoundError:
    print(f"Image not found. Please check {image_path}")
    exit()

labels = [
    "a photo of an air conditioner",
    "a photo of a damaged ceiling",
    "a photo of a door lock",
    "a photo of an electrical switch or wiring",
    "a photo of a ceiling fan",
    "a photo of furniture or a bed",
    "a photo of a plumbing fixture like a tap or toilet",
    "a photo of a general hostel room issue"
]

inputs = processor(
    text=labels,
    images=image,
    return_tensors="pt",
    padding=True
)

print("Running classification...")

with torch.no_grad():
    outputs = model(**inputs)

probabilities = outputs.logits_per_image.softmax(dim=1)[0]

results = list(zip(labels, probabilities))
results.sort(key=lambda x: x[1], reverse=True)

print("\nClassification Results:")
print("----------------------")

for label, probability in results:
    print(f"{label}: {probability.item() * 100:.2f}%")

best_label = results[0][0]
best_probability = results[0][1].item() * 100

print("\nBest prediction:")
print(f"{best_label} ({best_probability:.2f}%)")