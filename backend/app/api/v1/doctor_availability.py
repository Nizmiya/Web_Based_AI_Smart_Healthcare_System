"""Doctor availability and leave – doctor/admin only."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.api.v1.auth import get_current_user
from app.models.doctor_availability import DoctorLeaveCreate, BulkReassignRequest
from app.core.doctor_leave import (
    get_available_doctors,
    is_doctor_on_leave,
    is_doctor_on_leave_between,
)
from app.core.specializations import get_specialization_label
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

    # Notify all admins about the new doctor leave
    try:
        admins = await db.users.find({"role": "admin"}).to_list(length=None)
        for admin in admins:
            await db.notifications.insert_one(
                {
                    "user_id": str(admin["_id"]),
                    "type": "doctor_leave",
                    "title": "Doctor Leave Submitted",
                    "message": f"Doctor {doctor.get('full_name', 'Doctor')} has requested leave from {doc['from_date']} to {doc['to_date']}.",
                    "is_read": False,
                    "created_at": datetime.utcnow(),
                    "doctor_id": str(doc_oid),
                    "leave_id": str(result.inserted_id),
                }
            )
    except Exception:
        # Notification issues should not block leave creation
        pass

    return {
        "id": str(result.inserted_id),
        "doctor_id": target_doctor_id,
        "from_date": doc["from_date"],
        "to_date": doc["to_date"],
        "reason": doc["reason"],
        "created_at": doc["created_at"].isoformat() if hasattr(doc.get("created_at"), "isoformat") else str(doc.get("created_at", "")),
    }


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

    def _serialize_leave(item: dict) -> dict:
        fd = item.get("from_date")
        td = item.get("to_date")
        ca = item.get("created_at")
        return {
            "id": str(item["_id"]),
            "doctor_id": str(item["doctor_id"]),
            "from_date": fd if isinstance(fd, str) else (fd.isoformat() if hasattr(fd, "isoformat") else str(fd)) if fd else "",
            "to_date": td if isinstance(td, str) else (td.isoformat() if hasattr(td, "isoformat") else str(td)) if td else "",
            "reason": item.get("reason", ""),
            "created_at": ca.isoformat() if ca and hasattr(ca, "isoformat") else str(ca) if ca else None,
        }

    cursor = db.doctor_leaves.find(query).sort("from_date", -1)
    raw = await cursor.to_list(length=500)
    items = [_serialize_leave(item) for item in raw]
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
    """Admin: list all doctors with their leaves, specialization, and patient counts."""
    doctors = await db.users.find({"role": "doctor"}).to_list(length=200)
    leaves = await db.doctor_leaves.find({}).sort("from_date", -1).to_list(length=1000)
    by_doctor = {}
    today_str = date.today().isoformat()
    for d in doctors:
        did = str(d["_id"])
        patient_count = await db.users.count_documents(
            {"role": "patient", "assigned_doctor_id": d["_id"]}
        )
        spec = d.get("specialization")
        by_doctor[did] = {
            "id": did,
            "full_name": d.get("full_name", ""),
            "email": d.get("email", ""),
            "specialization": spec,
            "specialization_label": get_specialization_label(spec) if spec else "Not assigned",
            "assigned_patient_count": patient_count,
            "is_on_leave_today": await is_doctor_on_leave(db, did),
            "leaves": [],
        }
    for L in leaves:
        did = str(L["doctor_id"])
        if did in by_doctor:
            fd = L.get("from_date", "")
            td = L.get("to_date", "")
            fd_str = fd if isinstance(fd, str) else (fd.isoformat() if hasattr(fd, "isoformat") else str(fd))
            td_str = td if isinstance(td, str) else (td.isoformat() if hasattr(td, "isoformat") else str(td))
            is_active = fd_str <= today_str <= td_str
            by_doctor[did]["leaves"].append({
                "id": str(L["_id"]),
                "from_date": fd_str,
                "to_date": td_str,
                "reason": L.get("reason"),
                "is_active": is_active,
            })
    return {"doctors": list(by_doctor.values())}


@router.get("/leave/{leave_id}/details")
async def get_leave_details(
    leave_id: str,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database),
):
    """Admin: leave details with assigned patients and available substitute doctors."""
    try:
        leave_oid = ObjectId(leave_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid leave ID")

    leave_doc = await db.doctor_leaves.find_one({"_id": leave_oid})
    if not leave_doc:
        raise HTTPException(status_code=404, detail="Leave not found")

    doctor_oid = leave_doc["doctor_id"]
    doctor = await db.users.find_one({"_id": doctor_oid, "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    fd = leave_doc.get("from_date", "")
    td = leave_doc.get("to_date", "")
    from_date = fd if isinstance(fd, str) else (fd.isoformat() if hasattr(fd, "isoformat") else str(fd))
    to_date = td if isinstance(td, str) else (td.isoformat() if hasattr(td, "isoformat") else str(td))

    patients_cursor = db.users.find(
        {"role": "patient", "assigned_doctor_id": doctor_oid}
    )
    raw_patients = await patients_cursor.to_list(length=500)
    patients = [
        {
            "id": str(p["_id"]),
            "full_name": p.get("full_name", ""),
            "email": p.get("email", ""),
        }
        for p in raw_patients
    ]

    spec = doctor.get("specialization")
    substitutes = await get_available_doctors(
        db,
        specialization=spec,
        exclude_doctor_id=str(doctor_oid),
        exclude_on_leave_between=(from_date, to_date),
    )
    if not substitutes:
        substitutes = await get_available_doctors(
            db,
            exclude_doctor_id=str(doctor_oid),
            exclude_on_leave_between=(from_date, to_date),
        )

    substitute_list = [
        {
            "id": str(s["_id"]),
            "full_name": s.get("full_name", ""),
            "email": s.get("email", ""),
            "specialization": s.get("specialization"),
            "specialization_label": get_specialization_label(s.get("specialization")),
        }
        for s in substitutes
    ]

    today_str = date.today().isoformat()
    return {
        "leave": {
            "id": str(leave_doc["_id"]),
            "from_date": from_date,
            "to_date": to_date,
            "reason": leave_doc.get("reason", ""),
            "is_active": from_date <= today_str <= to_date,
        },
        "doctor": {
            "id": str(doctor_oid),
            "full_name": doctor.get("full_name", ""),
            "email": doctor.get("email", ""),
            "specialization": spec,
            "specialization_label": get_specialization_label(spec) if spec else "Not assigned",
        },
        "assigned_patients": patients,
        "available_substitutes": substitute_list,
    }


@router.post("/reassign-patients")
async def bulk_reassign_patients(
    body: BulkReassignRequest,
    admin_user: dict = Depends(require_admin),
    db=Depends(get_database),
):
    """Admin: reassign patients from one doctor to an available substitute."""
    if body.from_doctor_id == body.to_doctor_id:
        raise HTTPException(status_code=400, detail="Cannot reassign to the same doctor")

    try:
        from_oid = ObjectId(body.from_doctor_id)
        to_oid = ObjectId(body.to_doctor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")

    from_doctor = await db.users.find_one({"_id": from_oid, "role": "doctor"})
    to_doctor = await db.users.find_one({"_id": to_oid, "role": "doctor"})
    if not from_doctor:
        raise HTTPException(status_code=404, detail="Source doctor not found")
    if not to_doctor:
        raise HTTPException(status_code=404, detail="Substitute doctor not found")
    if not to_doctor.get("is_active", True):
        raise HTTPException(status_code=400, detail="Substitute doctor is inactive")

    leave_range = None
    if body.leave_id:
        try:
            leave_doc = await db.doctor_leaves.find_one({"_id": ObjectId(body.leave_id)})
        except Exception:
            leave_doc = None
        if leave_doc:
            fd = leave_doc.get("from_date", "")
            td = leave_doc.get("to_date", "")
            leave_range = (
                fd if isinstance(fd, str) else str(fd),
                td if isinstance(td, str) else str(td),
            )

    if leave_range:
        if await is_doctor_on_leave_between(db, body.to_doctor_id, leave_range[0], leave_range[1]):
            raise HTTPException(
                status_code=400,
                detail="Substitute doctor is also on leave during this period",
            )
    elif await is_doctor_on_leave(db, body.to_doctor_id):
        raise HTTPException(status_code=400, detail="Substitute doctor is currently on leave")

    query = {"role": "patient", "assigned_doctor_id": from_oid}
    if body.patient_ids:
        try:
            patient_oids = [ObjectId(pid) for pid in body.patient_ids]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid patient ID in list")
        query["_id"] = {"$in": patient_oids}

    patients = await db.users.find(query).to_list(length=500)
    if not patients:
        raise HTTPException(status_code=404, detail="No matching patients found to reassign")

    result = await db.users.update_many(
        query,
        {"$set": {"assigned_doctor_id": to_oid}},
    )

    for patient in patients:
        await db.notifications.insert_one(
            {
                "user_id": str(to_oid),
                "type": "patient_reassigned",
                "title": "Patients Reassigned During Leave",
                "message": (
                    f"Patient {patient.get('full_name', 'Unknown')} has been reassigned to you "
                    f"while Dr. {from_doctor.get('full_name', 'Doctor')} is on leave."
                ),
                "is_read": False,
                "created_at": datetime.utcnow(),
                "patient_id": str(patient["_id"]),
                "from_doctor_id": body.from_doctor_id,
                "to_doctor_id": body.to_doctor_id,
            }
        )

    return {
        "message": "Patients reassigned successfully",
        "reassigned_count": result.modified_count,
        "to_doctor_id": body.to_doctor_id,
        "to_doctor_name": to_doctor.get("full_name", ""),
    }
