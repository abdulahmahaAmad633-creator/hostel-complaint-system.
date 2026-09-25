# AI Module API

## POST /photo

Analyzes a hostel maintenance photo and returns category, priority, and confidence.

**Request:** multipart/form-data
- Field name: `photo`
- Accepted types: jpg, jpeg, png
- Max size: 10MB

**Success response (200):**
```json
{
  "category": "electrical",
  "confidence": 42.65,
  "priority": "HIGH",
  "needs_manual_review": false
}
```

**Categories:** ac, ceiling, door_lock, electrical, fan, furniture_bed, other, plumbing
**Priorities:** HIGH, MEDIUM, LOW

**Error responses (400):**
```json
{"error": "No file provided. Send as form-data with key 'photo'."}
```

## GET /

Health check. Returns `{"status": "AI module running"}`.

## Running locally