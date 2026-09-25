import torch
from torchvision import transforms, models
from PIL import Image
import torch.nn as nn
from priority import get_priority

class_names = ['ac', 'ceiling', 'door_lock', 'electrical', 'fan', 'furniture_bed', 'other', 'plumbing']

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                          std=[0.229, 0.224, 0.225])
])

model = models.mobilenet_v2(weights=None)
model.classifier[1] = nn.Linear(model.last_channel, len(class_names))
model.load_state_dict(torch.load("ai_module/mobilenet_hostel.pth", map_location="cpu"))
model.eval()

def classify_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence, predicted_idx = torch.max(probabilities, 0)

    category = class_names[predicted_idx.item()]
    confidence_pct = confidence.item() * 100

    return category, confidence_pct

def classify_and_prioritize(image_path):
    category, confidence = classify_image(image_path)
    priority_info = get_priority(category, confidence)
    return {
        "category": category,
        "confidence": round(confidence, 2),
        "priority": priority_info["priority"],
        "needs_manual_review": priority_info["needs_manual_review"],
    }
if __name__ == "__main__":
       result = classify_and_prioritize("data/val/furniture_bed/furniture_bed_001.jpeg")
       print(result)