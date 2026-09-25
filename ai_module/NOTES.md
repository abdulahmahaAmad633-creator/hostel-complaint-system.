# SentinelAI / Hostel Complaint System — AI Module Development Log

## Day 2: Zero-shot CLIP Baseline

Built a zero-shot classifier using pretrained CLIP (no training required), 
testing photo classification against 8 text-label descriptions.

### Test results
| Category (actual) | Predicted | Confidence | Correct? |
|---|---|---|---|
| electrical | electrical | 98.86% | Yes |
| plumbing | plumbing | 98.30% | Yes |
| fan | air conditioner | 27.90% | No |
| ac | damaged ceiling | 48.48% | No |

### Finding
Zero-shot CLIP is highly reliable for visually distinct categories 
(electrical, plumbing) but confuses ceiling-mounted categories 
(ac, fan, ceiling damage) — likely due to visual similarity in 
cropped/close-up photos taken at odd angles.

### Decision
This justifies fine-tuning a dedicated classifier (MobileNetV2) 
on our actual 8-category dataset, rather than shipping zero-shot 
CLIP as the final model.

---

## Day 3: Fine-tuned MobileNetV2

Fine-tuned MobileNetV2 (transfer learning, frozen feature layers, 
10 epochs) on the full 8-category dataset (128 train / 32 val images, 
16/4 split per category).

**Train accuracy: 92.19%**
**Validation accuracy: 87.50%**
(train-val gap of ~5 points — mild overfitting, expected given small 
dataset size of only 16 images per category)

### Per-category validation accuracy
| Category | Accuracy |
|---|---|
| ac | 100% (4/4) |
| ceiling | 100% (4/4) |
| door_lock | 100% (4/4) |
| electrical | 100% (4/4) |
| plumbing | 100% (4/4) |
| fan | 75% (3/4) |
| furniture_bed | 75% (3/4) |
| other | 50% (2/4) |

### Comparison: Zero-shot CLIP vs Fine-tuned MobileNetV2
The fine-tuned model directly fixes the ac/fan/ceiling confusion found 
in Day 2's zero-shot testing. Zero-shot CLIP got "ac" wrong (predicted 
ceiling at 48.5% confidence) and "fan" wrong (predicted ac at 27.9%). 
The fine-tuned model gets both ac and ceiling at 100%, and fan at 75%.

### Decision
Ship the fine-tuned MobileNetV2 model as the primary classifier. 
"other" remains weak (50%) — expected since it's an inherently vague 
catch-all category with only 16 training images. Noted as a known 
limitation, not a blocker for this project's scope.

---

## Day 4: Prediction pipeline verification + priority logic

### Verification
Ran predict.py's classify_image() against the full validation set 
(32 images) via verify_predict.py — result: 87.50% (28/32), exactly 
matching Day 3's training-time validation accuracy. Confirms no bugs 
in the inference pipeline.

### Key finding: confidence is not a reliable proxy for correctness
Many correct predictions have surprisingly low confidence scores:
- ac_005.jpeg: correct at only 30.96%
- electrical_011.jpeg: correct at only 31.64%
- plumbing_014.jpeg: correct at only 32.16%

This means the model is frequently right without being confident 
about it — a meaningfully different finding than accuracy alone 
would suggest.

### Misclassifications (4/32)
- fan_014 → predicted ceiling
- furniture_bed_002 → predicted door_lock
- other_001 → predicted electrical
- other_006 → predicted door_lock

Notably, "other" (the vague catch-all category) failed both its 
wrong cases, consistent with Day 3's finding that "other" is the 
weakest category.

### Priority logic design decision
Given confidence is often low even on correct predictions, a fixed 
confidence threshold (e.g., "flag if <50%") would incorrectly flag 
many correct predictions for manual review. Set LOW_CONFIDENCE_THRESHOLD 
to 25% (conservative) rather than a typical 50%+ cutoff, so only 
genuinely extreme low-confidence cases get flagged and downgraded 
in priority.

### Severity map
- HIGH: electrical, plumbing
- MEDIUM: ceiling, ac, fan, door_lock
- LOW: furniture_bed, other

Built classify_and_prioritize() in predict.py, returning 
{category, confidence, priority, needs_manual_review} — matches 
the project's required API contract.

---

## Day 5: Flask API endpoint

Wrapped classify_and_prioritize() as a Flask REST API (POST /photo), 
matching the project's required contract:
`POST /photo → {category, priority, confidence}`

### Validation added
- File presence check
- Extension whitelist (jpg, jpeg, png only)
- File size limit (10MB max)
- Image integrity check via PIL (catches corrupted/renamed non-image files)
- Automatic temp file cleanup after every request (success or failure)

### Verified working
- Health check endpoint (GET /) returns {"status": "AI module running"}
- Valid photo upload returns correct classification + priority JSON
- No-file request correctly returns 400 error
- Non-image file (fake.txt) correctly rejected with clear error message

API contract documented in API.md for backend integration (Member 2).

---

## Day 6: Automated testing + logging

### Automated test suite (test_api.py)
Three tests, all passing against a live server:
- test_health_check — confirms GET / returns 200
- test_valid_photo — confirms POST /photo with real image returns 
  200 and valid category in response
- test_no_file — confirms POST /photo with no file returns 400

### Edge case testing
Uploaded a non-image .txt file renamed with no valid extension — 
correctly rejected with "Invalid file type" error, no crash, no 
false classification.

### Logging added
Added Python logging to app.py — every processed request now logs 
the filename and full classification result, visible in the Flask 
server's terminal output. Useful for debugging once integrated with 
the team's backend.

### Process management note
Discovered 16 stray Python processes running simultaneously from 
repeated Flask restarts during development (each Ctrl+C didn't 
always fully terminate the process). Resolved with 
`Stop-Process -Name python -Force`. Lesson: check `Get-Process python` 
if server behavior seems inconsistent across terminal sessions.

---

## Day 7: Final documentation and handoff prep

- Added top-level README.md documenting setup, API usage, file 
  structure, and known limitations for the AI module.
- Verified full test suite still passes after all changes.
- Confirmed temp_uploads folder cleans up properly (empty after 
  test runs, no leaked files).
- Prepared for handoff to Member 2 (backend) via shared GitHub repo, 
  ai-integration branch.

## Overall summary
Built a complete AI module for hostel maintenance photo classification: 
zero-shot baseline → identified real limitations → fine-tuned model 
to fix them → wrapped as tested, documented, production-ready API. 
Every claim in this log is backed by actual test output, not assumption.