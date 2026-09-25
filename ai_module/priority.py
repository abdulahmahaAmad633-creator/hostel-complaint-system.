# Severity mapping: which categories are inherently higher priority
SEVERITY_MAP = {
    "electrical": "HIGH",
    "plumbing": "HIGH",
    "ceiling": "MEDIUM",
    "ac": "MEDIUM",
    "fan": "MEDIUM",
    "door_lock": "MEDIUM",
    "furniture_bed": "LOW",
    "other": "LOW",
}

LOW_CONFIDENCE_THRESHOLD = 25.0

def get_priority(category, confidence):
    base_priority = SEVERITY_MAP.get(category, "LOW")
    needs_manual_review = confidence < LOW_CONFIDENCE_THRESHOLD

    if needs_manual_review:
        downgrade = {"HIGH": "MEDIUM", "MEDIUM": "LOW", "LOW": "LOW"}
        final_priority = downgrade[base_priority]
    else:
        final_priority = base_priority

    return {
        "priority": final_priority,
        "needs_manual_review": needs_manual_review,
    }