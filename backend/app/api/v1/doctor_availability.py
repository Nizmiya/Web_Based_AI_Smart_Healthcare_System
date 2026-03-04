"""Doctor availability and leave – doctor/admin only."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.api.v1.auth import get_current_user
from app.models.doctor_availability import DoctorLeaveCreate
from bson import ObjectId
from datetime import datetime, date
from typing import Optional

router = APIRouter()


def require_doctor_or_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors or admins can perform this action",
        )
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action",
        )
    return current_user


@router.post("/leave", status_code=status.HTTP_201_CREATED)
async def add_leave(
    body: DoctorLeaveCreate,
    doctor_id: Optional[str] = None,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database),
):
    """Add leave. Doctor: own only (doctor_id ignored). Admin: can set doctor_id."""
    role = current_user.get("role")
    if role == "doctor":
        target_doctor_id = current_user["id"]
    else:
        if not doctor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin must provide doctor_id",
            )
        target_doctor_id = doctor_id

    if body.to_date < body.from_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="to_date must be >= from_date",
        )

    try:
        doc_oid = ObjectId(target_doctor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")

    doctor = await db.users.find_one({"_id": doc_oid, "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doc = {
        "doctor_id": doc_oid,
        "from_date": body.from_date.isoformat(),
        "to_date": body.to_date.isoformat(),
        "reason": body.reason or "",
        "created_at": datetime.utcnow(),
    }
    result = await db.doctor_leaves.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["doctor_id"] = target_doctor_id
    return doc


@router.get("/leave")
async def list_leaves(
    doctor_id: Optional[str] = None,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database),
):
    """List leaves. Doctor: own only. Admin: all or filter by doctor_id."""
    role = current_user.get("role")
    query = {}
    if role == "doctor":
        query["doctor_id"] = ObjectId(current_user["id"])
    elif doctor_id:
        try:
            query["doctor_id"] = ObjectId(doctor_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid doctor_id")

    cursor = db.doctor_leaves.find(query).sort("from_date", -1)
    items = await cursor.to_list(length=500)
    for item in items:
        item["id"] = str(item["_id"])
        item["doctor_id"] = str(item["doctor_id"])
        item.pop("_id", None)
    return {"leaves": items}


@router.delete("/leave/{leave_id}")
async def delete_leave(
    leave_id: str,
    current_user: dict = Depends(require_doctor_or_admin),
    db=Depends(get_database),
):
    """Delete a leave entry. Doctor: own only. Admin: any."""
    try:
        oid = ObjectId(leave_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid leave ID")

    leave_doc = await db.doctor_leaves.find_one({"_id": oid})
    if not leave_doc:
        raise HTTPException(status_code=404, detail="Leave not found")

    if current_user.get("role") == "doctor":
        if str(leave_doc["doctor_id"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Can only delete your own leave")

    await db.doctor_leaves.delete_one({"_id": oid})
    return {"message": "Leave deleted successfully"}


@router.get("/doctors-with-leaves")
async def list_doctors_with_leaves(
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database),
):
    """Admin: list all doctors with their upcoming/past leaves."""
    doctors = await db.users.find({"role": "doctor"}).to_list(length=200)
    leaves = await db.doctor_leaves.find({}).sort("from_date", -1).to_list(length=1000)
    by_doctor = {}
    for d in doctors:
        did = str(d["_id"])
        by_doctor[did] = {
            "id": did,
            "full_name": d.get("full_name", ""),
            "email": d.get("email", ""),
            "leaves": [],
        }
    for L in leaves:
        did = str(L["doctor_id"])
        if did in by_doctor:
            by_doctor[did]["leaves"].append({
                "id": str(L["_id"]),
                "from_date": L.get("from_date"),
                "to_date": L.get("to_date"),
                "reason": L.get("reason"),
            })
    return {"doctors": list(by_doctor.values())}
