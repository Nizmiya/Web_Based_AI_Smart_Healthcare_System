from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.api.v1.auth import get_current_user, get_password_hash
from app.models.user import UserResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId

router = APIRouter()

class DoctorCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    password: str

class UserUpdateActive(BaseModel):
    is_active: bool

class AssignDoctorRequest(BaseModel):
    doctor_id: str

class SettingsUpdate(BaseModel):
    systemName: Optional[str] = None
    maxFileSize: Optional[str] = None
    sessionTimeout: Optional[str] = None
    emailNotifications: Optional[bool] = None
    smsNotifications: Optional[bool] = None
    maintenanceMode: Optional[bool] = None
    allowRegistration: Optional[bool] = None

def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to require admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return current_user

@router.post("/doctors", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor_data: DoctorCreate,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Create a new doctor account (Admin only)"""
    # Check if doctor already exists
    existing_user = await db.users.find_one({"email": doctor_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create doctor user
    doctor_dict = {
        "email": doctor_data.email,
        "full_name": doctor_data.full_name,
        "phone": doctor_data.phone,
        "role": "doctor",  # Always doctor
        "password": get_password_hash(doctor_data.password),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "created_by": admin_user["id"]  # Track who created this doctor
    }
    
    result = await db.users.insert_one(doctor_dict)
    doctor_dict["id"] = str(result.inserted_id)
    doctor_dict.pop("password", None)
    doctor_dict.pop("created_by", None)
    
    return UserResponse(**doctor_dict)

@router.get("/doctors")
async def list_doctors(
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """List all doctors (Admin only)"""
    doctors = await db.users.find({"role": "doctor"}).to_list(length=100)
    
    result = []
    for doctor in doctors:
        doctor["id"] = str(doctor["_id"])
        doctor.pop("password", None)
        doctor.pop("_id", None)
        result.append(doctor)
    
    return result

@router.delete("/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Delete a doctor account (Admin only)"""
    try:
        result = await db.users.delete_one({"_id": ObjectId(doctor_id), "role": "doctor"})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        return {"message": "Doctor deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid doctor ID: {str(e)}"
        )

@router.patch("/users/{user_id}")
async def update_user_active(
    user_id: str,
    body: UserUpdateActive,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Activate or deactivate a user (Admin only)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
    result = await db.users.update_one(
        {"_id": oid},
        {"$set": {"is_active": body.is_active}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User updated successfully", "is_active": body.is_active}

@router.post("/patients/{patient_id}/assign-doctor")
async def assign_doctor_to_patient(
    patient_id: str,
    body: AssignDoctorRequest,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Assign a doctor to a patient (Admin only)."""
    try:
        patient_oid = ObjectId(patient_id)
        doctor_oid = ObjectId(body.doctor_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID")
    patient = await db.users.find_one({"_id": patient_oid, "role": "patient"})
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    doctor = await db.users.find_one({"_id": doctor_oid, "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    await db.users.update_one(
        {"_id": patient_oid},
        {"$set": {"assigned_doctor_id": doctor_oid}}
    )
    return {"message": "Doctor assigned successfully"}

@router.delete("/patients/{patient_id}/assign-doctor")
async def unassign_doctor_from_patient(
    patient_id: str,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Remove assigned doctor from patient (Admin only)."""
    try:
        patient_oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patient ID")
    result = await db.users.update_one(
        {"_id": patient_oid, "role": "patient"},
        {"$unset": {"assigned_doctor_id": ""}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return {"message": "Doctor unassigned successfully"}

# ----- Settings (persist in DB) -----
DEFAULT_SETTINGS = {
    "systemName": "Smart Healthcare System",
    "maxFileSize": "10",
    "sessionTimeout": "30",
    "emailNotifications": True,
    "smsNotifications": False,
    "maintenanceMode": False,
    "allowRegistration": True,
}

@router.get("/settings")
async def get_settings(
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Get system settings (Admin only). Stored in DB."""
    doc = await db.system_settings.find_one({"_id": "global"})
    if not doc:
        return DEFAULT_SETTINGS
    doc.pop("_id", None)
    return doc

@router.put("/settings")
async def update_settings(
    body: SettingsUpdate,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Update system settings (Admin only)."""
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return {"message": "No updates provided"}
    await db.system_settings.update_one(
        {"_id": "global"},
        {"$set": updates},
        upsert=True
    )
    return {"message": "Settings saved successfully"}

# ----- Reports / Analytics -----
@router.get("/reports/summary")
async def get_reports_summary(
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database)
):
    """Get prediction, user, and consultation statistics for admin dashboard (Admin only)."""
    total_patients = await db.users.count_documents({"role": "patient"})
    total_doctors = await db.users.count_documents({"role": "doctor"})
    total_predictions = await db.predictions.count_documents({})
    high_risk = await db.predictions.count_documents({
        "risk_level": {"$in": ["High", "Critical"]}
    })
    by_disease = {}
    for dtype in ["diabetes", "heart_disease", "kidney_disease"]:
        by_disease[dtype] = await db.predictions.count_documents({"disease_type": dtype})
    total_consultations = await db.consultations.count_documents({})
    consultations_completed = await db.consultations.count_documents({"status": "completed"})
    consultations_scheduled = await db.consultations.count_documents({"status": "scheduled"})
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_predictions": total_predictions,
        "high_risk_predictions": high_risk,
        "predictions_by_disease": by_disease,
        "total_consultations": total_consultations,
        "consultations_completed": consultations_completed,
        "consultations_scheduled": consultations_scheduled,
    }

# ----- ML Models list -----
# ----- Audit log (Admin only) -----
@router.get("/audit-logs")
async def get_audit_logs(
    admin_user: dict = Depends(require_admin),
    limit: int = 100,
    skip: int = 0,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    patient_id: Optional[str] = None,
    db=Depends(get_database)
):
    """Get audit log entries – who accessed what and when (Admin only)."""
    query = {}
    if user_id:
        try:
            query["user_id"] = str(user_id)
        except Exception:
            pass
    if action:
        query["action"] = action
    if patient_id:
        query["patient_id"] = patient_id
    cursor = db.audit_logs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["id"] = str(item["_id"])
        item.pop("_id", None)
    total = await db.audit_logs.count_documents(query)
    return {"logs": items, "total": total}

@router.get("/models")
async def list_ml_models(
    admin_user: dict = Depends(require_admin),
):
    """List ML model files (Admin only). Read from ml_models folder."""
    import os
    from app.core.config import settings
    path = getattr(settings, "ML_MODELS_PATH", None) or os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_models")
    if not os.path.isabs(path):
        path = os.path.abspath(path)
    if not os.path.exists(path):
        return {"models": [], "path": path}
    files = []
    for f in os.listdir(path):
        if f.endswith(".pkl") or f == "threshold.json":
            files.append(f)
    return {"models": sorted(files), "path": path}

