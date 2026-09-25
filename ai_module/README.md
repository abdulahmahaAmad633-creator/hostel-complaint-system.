# AI Module — Hostel Complaint Classification

## What this does
Classifies uploaded maintenance photos into 8 categories 
(ac, ceiling, door_lock, electrical, fan, furniture_bed, other, 
plumbing) and assigns a priority level (HIGH/MEDIUM/LOW) with a 
confidence score.

## Approach
1. Started with zero-shot CLIP (no training) — found it confused 
   visually similar ceiling-mounted categories (ac/fan/ceiling), 
   with predictions as low as 27.9% confidence and wrong answers.
2. Fine-tuned MobileNetV2 on 128 real training images — fixed 
   that confusion, achieved 87.5% validation accuracy.
3. Discovered confidence scores don't always correlate with 
   correctness on this small dataset — many correct predictions 
   score 30-50% confidence. Documented and accounted for in the 
   priority/review-flag logic.
4. Wrapped as a Flask API (`POST /photo`) with input validation, 
   automated tests, and logging for backend integration.

## Setup

Server runs on `http://127.0.0.1:5000`

## API
See API.md for full endpoint documentation.

## Testing

Runs automated tests against a live server (start app.py first).

## Files
- `classifier.py` — original zero-shot CLIP baseline
- `train_classifier.py` — MobileNetV2 fine-tuning script
- `predict.py` — production inference (loads trained model, classifies + prioritizes)
- `priority.py` — severity mapping and manual-review logic
- `app.py` — Flask API
- `test_api.py` — automated API tests
- `verify_predict.py` — validates predict.py against full validation set
- `mobilenet_hostel.pth` — trained model weights
- `NOTES.md` — full development log with all test results and decisions

## Known limitations
- Small dataset (16 train images per category) — "other" category 
  is weakest at 50% accuracy since it's an inherently vague catch-all.
- Confidence scores are not always high even on correct predictions — 
  treated as a secondary signal, not a strict correctness threshold.
- Fan category has the most confusion (75% accuracy), likely due to 
  visual overlap with ceiling in some angles.