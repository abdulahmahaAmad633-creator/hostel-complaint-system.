import os
from predict import classify_image

val_dir = "data/val"
class_names = ['ac', 'ceiling', 'door_lock', 'electrical', 'fan', 'furniture_bed', 'other', 'plumbing']

correct = 0
total = 0

for true_label in class_names:
    folder = os.path.join(val_dir, true_label)
    for filename in os.listdir(folder):
        image_path = os.path.join(folder, filename)
        predicted, confidence = classify_image(image_path)
        total += 1
        is_correct = predicted == true_label
        if is_correct:
            correct += 1
        print(f"{true_label}/{filename}: predicted={predicted} ({confidence:.2f}%) {'✓' if is_correct else '✗'}")

print(f"\nOverall accuracy via predict.py: {100*correct/total:.2f}% ({correct}/{total})")