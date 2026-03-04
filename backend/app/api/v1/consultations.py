"""Consultations API - schedule and manage doctor-patient consultations."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.api.v1.auth import get_current_user
from app.models.consultation import ConsultationCreate, ConsultationUpdate, ConsultationStatus
from bson import ObjectId
from typing import Optional
from datetime import datetime

router = APIRouter()


@router.get("/stats")
async def get_consultation_stats(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Doctor/admin: get consultation and patient stats. Doctor sees own only, admin sees all."""
    role = current_user.get("role")
    if role not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    doctor_oid = None
    if role == "doctor":
        did = current_user.get("_id") or current_user.get("id")
        doctor_oid = ObjectId(did) if isinstance(did, str) and len(did) == 24 else did
    base = {"doctor_id": doctor_oid} if doctor_oid else {}
    total = await db.consultations.count_documents(base)
    completed = await db.consultations.count_documents({**base, "status": "completed"})
    scheduled = await db.consultations.count_documents({**base, "status": "scheduled"})
    cancelled = await db.consultations.count_documents({**base, "status": "cancelled"})
    # High-risk predictions count for this doctor's patients (doctor sees own patients only)
    if doctor_oid:
        my_patient_ids = await db.consultations.distinct("patient_id", {"doctor_id": doctor_oid})
        high_risk = await db.predictions.count_documents({
            "user_id": {"$in": [str(pid) for pid in my_patient_ids]},
            "risk_level": {"$in": ["High", "Critical"]}
        })
    else:
        high_risk = await db.predictions.count_documents({"risk_level": {"$in": ["High", "Critical"]}})
    return {
        "total_consultations": total,
        "consultations_completed": completed,
        "consultations_scheduled": scheduled,
        "consultations_cancelled": cancelled,
        "high_risk_patients_count": high_risk,
    }


def require_doctor_or_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors or admins can perform this action"
        )
    return current_user

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_consultation(
    body: ConsultationCreate,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database)
):
    """Create a consultation (doctor or admin)."""
    try:
        patient_oid = ObjectId(body.patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patient ID")
    patient = await db.users.find_one({"_id": patient_oid, "role": "patient"})
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    doctor_oid = current_user.get("_id") or ObjectId(current_user["id"])
    doc = {
        "patient_id": patient_oid,
        "doctor_id": doctor_oid,
        "scheduled_at": body.scheduled_at,
        "status": ConsultationStatus.scheduled.value,
        "notes": body.notes or "",
        "doctor_private_notes": (body.doctor_private_notes or "").strip(),
        "created_at": datetime.utcnow(),
    }
    result = await db.consultations.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["patient_id"] = body.patient_id
    doc["doctor_id"] = str(doctor_oid)
    return doc

@router.get("")
async def list_consultations(
    current_user: dict = Depends(get_current_user),
    patient_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    db=Depends(get_database)
):
    """List consultations. Patient: own only. Doctor: own only. Admin: all."""
    role = current_user.get("role")
    query = {}
    if role == "patient":
        try:
            query["patient_id"] = ObjectId(current_user["id"])
        except Exception:
            query["patient_id"] = current_user["id"]
    elif role in ("doctor", "admin"):
        if role == "doctor":
            did = current_user.get("_id") or current_user.get("id")
            query["doctor_id"] = ObjectId(did) if isinstance(did, str) and len(did) == 24 else did
        if patient_id:
            try:
                query["patient_id"] = ObjectId(patient_id)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid patient_id")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if status_filter:
        query["status"] = status_filter
    cursor = db.consultations.find(query).sort("scheduled_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["id"] = str(item["_id"])
        item["patient_id"] = str(item["patient_id"])
        item["doctor_id"] = str(item["doctor_id"])
        item.pop("_id", None)
        if role == "patient":
            item.pop("doctor_private_notes", None)
        try:
            u = await db.users.find_one({"_id": ObjectId(item["patient_id"])})
            item["patient_name"] = u.get("full_name", "Unknown") if u else "Unknown"
        except Exception:
            item["patient_name"] = "Unknown"
    return {"consultations": items}

@router.patch("/{consultation_id}")
async def update_consultation(
    consultation_id: str,
    body: ConsultationUpdate,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database)
):
    """Update consultation (reschedule, status, notes). Doctor or admin."""
    try:
        oid = ObjectId(consultation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid consultation ID")
    consultation = await db.consultations.find_one({"_id": oid})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    updates = body.model_dump(exclude_none=True)
    if "status" in updates:
        updates["status"] = updates["status"].value if hasattr(updates["status"], "value") else updates["status"]
    # doctor_private_notes: allow empty string to clear
    if "doctor_private_notes" in updates:
        updates["doctor_private_notes"] = (updates["doctor_private_notes"] or "").strip()
    if not updates:
        return {"message": "No updates provided"}
    await db.consultations.update_one({"_id": oid}, {"$set": updates})
    return {"message": "Consultation updated successfully"}

@router.get("/{consultation_id}")
async def get_consultation(
    consultation_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get single consultation. Patient: own only. Doctor/Admin: any."""
    try:
        oid = ObjectId(consultation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid consultation ID")
    consultation = await db.consultations.find_one({"_id": oid})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    role = current_user.get("role")
    if role == "patient":
        pid = str(consultation.get("patient_id"))
        if pid != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Forbidden")
        consultation.pop("doctor_private_notes", None)
    consultation["id"] = str(consultation["_id"])
    consultation["patient_id"] = str(consultation["patient_id"])
    consultation["doctor_id"] = str(consultation["doctor_id"])
    consultation.pop("_id", None)
    return consultation
