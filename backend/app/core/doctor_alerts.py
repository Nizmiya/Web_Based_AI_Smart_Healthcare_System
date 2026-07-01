from datetime import datetime
from typing import Any, Dict

from bson import ObjectId

from app.core.doctor_leave import get_available_doctors, is_doctor_on_leave
from app.core.specializations import (
    DISEASE_DISPLAY_NAMES,
    get_specialization_for_disease,
    get_specialization_label,
)


async def notify_high_risk_specialists(
    db,
    *,
    disease_type: str,
    current_user: Dict[str, Any],
    risk_level: str,
    risk_percentage: float,
    prediction_id: str,
) -> int:
    """Notify available specialists matching the disease (skip doctors on leave)."""
    specialization = get_specialization_for_disease(disease_type)
    if not specialization:
        return 0

    disease_label = DISEASE_DISPLAY_NAMES.get(
        disease_type, disease_type.replace("_", " ").title()
    )
    specialist_label = get_specialization_label(specialization)

    patient = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    assigned_doctor_id = None
    if patient and patient.get("assigned_doctor_id"):
        assigned_doctor_id = str(patient["assigned_doctor_id"])

    available = await get_available_doctors(db, specialization=specialization)

    # If patient's assigned doctor is on leave, alerts must go to other available doctors
    if assigned_doctor_id and await is_doctor_on_leave(db, assigned_doctor_id):
        available = [
            d for d in available if str(d["_id"]) != assigned_doctor_id
        ]

    if not available:
        # Fallback: any active doctor not on leave today
        available = await get_available_doctors(db)
        if assigned_doctor_id and await is_doctor_on_leave(db, assigned_doctor_id):
            available = [
                d for d in available if str(d["_id"]) != assigned_doctor_id
            ]

    for doctor in available:
        doctor_notification = {
            "user_id": str(doctor["_id"]),
            "type": "high_risk",
            "title": f"High Risk Alert - {disease_label}",
            "message": (
                f"Patient {current_user.get('full_name', 'Unknown')} has {risk_level.lower()} "
                f"risk ({round(risk_percentage, 2)}%) for {disease_label}. "
                f"Specialist review required ({specialist_label})."
            ),
            "is_read": False,
            "created_at": datetime.utcnow(),
            "prediction_id": prediction_id,
            "patient_id": current_user["id"],
            "disease_type": disease_type,
            "specialization": specialization,
        }
        await db.notifications.insert_one(doctor_notification)

    return len(available)
