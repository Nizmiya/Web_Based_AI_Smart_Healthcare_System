from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.api.v1.auth import get_current_user
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

# Allowed profile fields for patient self-update (including medical info)
PROFILE_FIELDS = {
    "full_name", "phone", "age", "gender", "address", "emergency_contact",
    "medical_history", "allergies", "current_medications"
}

def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to require admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return current_user

def require_doctor_or_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to require doctor or admin role"""
    if current_user.get("role") not in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors or admins can perform this action"
        )
    return current_user

class DoctorRemarkCreate(BaseModel):
    remark: str

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    """Get user profile (includes medical_history, allergies, current_medications). Patients do not see doctor_remarks."""
    user = await db.users.find_one({"_id": current_user["_id"]})
    if user:
        user["id"] = str(user["_id"])
        user.pop("password", None)
        user.pop("_id", None)
        if user.get("role") == "patient":
            user.pop("doctor_remarks", None)
    return user

@router.put("/profile")
async def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    """Update user profile (patient: own profile including medical history, allergies, medications)"""
    # Restrict to allowed fields only
    allowed = {k: v for k, v in profile_data.items() if k in PROFILE_FIELDS}
    if not allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid profile fields provided")
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": allowed}
    )
    return {"message": "Profile updated successfully"}

@router.get("/patients/{patient_id}/profile")
async def get_patient_profile(
    patient_id: str,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database)
):
    """Get a patient's profile (doctor/admin only). Includes doctor_remarks. Logged to audit."""
    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patient ID")
    user = await db.users.find_one({"_id": oid, "role": "patient"})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    from app.core.audit import log_audit
    await log_audit(
        db, current_user["id"], current_user.get("role", ""),
        "view_patient_profile", "patient", patient_id,
    )
    user["id"] = str(user["_id"])
    user.pop("password", None)
    user.pop("_id", None)
    if user.get("assigned_doctor_id"):
        user["assigned_doctor_id"] = str(user["assigned_doctor_id"])
    return user

@router.post("/patients/{patient_id}/remarks")
async def add_patient_remark(
    patient_id: str,
    body: DoctorRemarkCreate,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database)
):
    """Add a medical remark to a patient's profile (doctor/admin only)."""
    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patient ID")
    user = await db.users.find_one({"_id": oid, "role": "patient"})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    remark_entry = {
        "doctor_id": current_user["id"],
        "doctor_name": current_user.get("full_name", "Doctor"),
        "remark": body.remark.strip(),
        "created_at": datetime.utcnow(),
    }
    await db.users.update_one(
        {"_id": oid},
        {"$push": {"doctor_remarks": remark_entry}}
    )
    return {"message": "Remark added successfully"}

@router.get("/all")
async def get_all_users(
    admin_user: dict = Depends(require_admin),
    role: str = None,
    db=Depends(get_database)
):
    """Get all users (Admin only) - optionally filter by role"""
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query).to_list(length=1000)
    
    result = []
    for user in users:
        user["id"] = str(user["_id"])
        user.pop("password", None)
        user.pop("_id", None)
        result.append(user)
    
    return result

@router.get("/patients")
async def get_all_patients(
    current_user: dict = Depends(get_current_user),
    search: Optional[str] = None,
    assigned_doctor_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    sort_by: Optional[str] = None,
    limit: int = 500,
    db=Depends(get_database)
):
    """Get all patients (Doctor and Admin only). Optional: search (name/email), assigned_doctor_id, risk_level (High/Critical), sort_by (name/created_at)."""
    if current_user.get("role") not in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can list patients"
        )
    query = {"role": "patient"}
    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"full_name": {"$regex": s, "$options": "i"}},
            {"email": {"$regex": s, "$options": "i"}},
            {"phone": {"$regex": s, "$options": "i"}},
        ]
    if assigned_doctor_id:
        try:
            query["assigned_doctor_id"] = ObjectId(assigned_doctor_id)
        except Exception:
            pass
    patients = await db.users.find(query).to_list(length=limit * 2)
    if risk_level and risk_level.strip():
        high_risk_levels = [rl.strip() for rl in risk_level.split(",") if rl.strip()]
        if high_risk_levels:
            high_risk_user_ids = await db.predictions.distinct(
                "user_id",
                {"risk_level": {"$in": high_risk_levels}}
            )
            high_risk_set = set(str(uid) for uid in high_risk_user_ids)
            patients = [p for p in patients if str(p["_id"]) in high_risk_set]
    if sort_by == "name":
        patients.sort(key=lambda p: (p.get("full_name") or "").lower())
    elif sort_by == "created_at":
        patients.sort(key=lambda p: p.get("created_at") or datetime.min, reverse=True)
    patients = patients[:limit]
    result = []
    for patient in patients:
        patient["id"] = str(patient["_id"])
        if patient.get("assigned_doctor_id"):
            patient["assigned_doctor_id"] = str(patient["assigned_doctor_id"])
        patient.pop("password", None)
        patient.pop("_id", None)
        patient.pop("doctor_remarks", None)
        result.append(patient)
    return result

