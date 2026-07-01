"""Disease-to-specialist mapping for high-risk alert routing."""

from typing import Optional

# Stored on doctor user documents as `specialization`
DISEASE_SPECIALIZATION = {
    "diabetes": "endocrinologist",
    "heart_disease": "cardiologist",
    "kidney_disease": "nephrologist",
}

SPECIALIZATION_OPTIONS = [
    {"value": "cardiologist", "label": "Cardiologist (Heart Disease)"},
    {"value": "endocrinologist", "label": "Endocrinologist (Diabetes)"},
    {"value": "nephrologist", "label": "Nephrologist (Kidney Disease)"},
]

SPECIALIZATION_LABELS = {opt["value"]: opt["label"] for opt in SPECIALIZATION_OPTIONS}

DISEASE_DISPLAY_NAMES = {
    "diabetes": "Diabetes",
    "heart_disease": "Heart Disease",
    "kidney_disease": "Kidney Disease",
}


def get_specialization_for_disease(disease_type: str) -> Optional[str]:
    return DISEASE_SPECIALIZATION.get(disease_type)


def get_specialization_label(specialization: str) -> str:
    return SPECIALIZATION_LABELS.get(specialization, specialization.replace("_", " ").title())
