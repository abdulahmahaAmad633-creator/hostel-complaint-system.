from PIL import Image
import os

categories = ["ac", "ceiling", "door_lock", "electrical", "fan", "furniture_bed", "other", "plumbing"]
train_dir = "data/train"

for cat in categories:
    cat_path = os.path.join(train_dir, cat)
    files = os.listdir(cat_path)
    if not files:
        print(f"{cat}: NO FILES FOUND")
        continue
    sample_file = files[0]
    img = Image.open(os.path.join(cat_path, sample_file))
    print(f"{cat}: {len(files)} images, sample '{sample_file}' -> size {img.size}, mode {img.mode}")