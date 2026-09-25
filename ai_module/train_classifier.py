import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# Resize + normalize images the way MobileNet expects
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                          std=[0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder("data/train", transform=transform)
val_dataset = datasets.ImageFolder("data/val", transform=transform)

train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=8, shuffle=False)

num_classes = len(train_dataset.classes)
print(f"Training on {num_classes} classes: {train_dataset.classes}")

# Load pretrained MobileNetV2
model = models.mobilenet_v2(weights="IMAGENET1K_V1")

# Freeze the pretrained feature-extraction layers
for param in model.features.parameters():
    param.requires_grad = False

# Replace the final classification layer to match our 8 categories
model.classifier[1] = nn.Linear(model.last_channel, num_classes)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print(f"Using device: {device}")

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.classifier.parameters(), lr=0.001)

num_epochs = 10

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_acc = 100 * correct / total
    print(f"Epoch {epoch+1}/{num_epochs} - Loss: {running_loss:.4f} - Train Accuracy: {train_acc:.2f}%")

print("\nTraining complete.")

# Save the trained model
torch.save(model.state_dict(), "ai_module/mobilenet_hostel.pth")
print("Model saved to ai_module/mobilenet_hostel.pth")

# Evaluate on validation set (images the model has never seen)
model.eval()
correct = 0
total = 0

with torch.no_grad():
    for images, labels in val_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

val_acc = 100 * correct / total
print(f"\nValidation Accuracy: {val_acc:.2f}%")
from collections import defaultdict

# Per-class accuracy breakdown
class_correct = defaultdict(int)
class_total = defaultdict(int)
class_names = train_dataset.classes

model.eval()
with torch.no_grad():
    for images, labels in val_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        for label, pred in zip(labels, predicted):
            class_total[label.item()] += 1
            if label.item() == pred.item():
                class_correct[label.item()] += 1

print("\nPer-category validation accuracy:")
for i, name in enumerate(class_names):
    total = class_total[i]
    correct = class_correct[i]
    acc = 100 * correct / total if total > 0 else 0
    print(f"  {name}: {correct}/{total} ({acc:.1f}%)")