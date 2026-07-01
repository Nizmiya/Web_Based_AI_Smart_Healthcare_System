"""Doctor leave checks for alert routing and admin reassignment."""
from datetime import date, datetime
from typing import List, Optional

from bson import ObjectId


def _to_date_str(value) -> str:
    if isinstance(value, str):
        return value[:10]
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)[:10]


async def is_doctor_on_leave(
    db,
    doctor_id: str,
    check_date: Optional[date] = None,
) -> bool:
    """Return True if doctor has leave covering check_date (default: today)."""
    if check_date is None:
        check_date = date.today()
    check_str = check_date.isoformat()
    try:
        doc_oid = ObjectId(doctor_id)
    except Exception:
        return False
    count = await db.doctor_leaves.count_documents(
        {
            "doctor_id": doc_oid,
            "from_date": {"$lte": check_str},
            "to_date": {"$gte": check_str},
        }
    )
    return count > 0


async def is_doctor_on_leave_between(
    db,
    doctor_id: str,
    from_date: str,
    to_date: str,
) -> bool:
    """Return True if doctor has any leave overlapping the given date range."""
    try:
        doc_oid = ObjectId(doctor_id)
    except Exception:
        return False
    count = await db.doctor_leaves.count_documents(
        {
            "doctor_id": doc_oid,
            "from_date": {"$lte": to_date},
            "to_date": {"$gte": from_date},
        }
    )
    return count > 0


async def get_available_doctors(
    db,
    *,
    specialization: Optional[str] = None,
    check_date: Optional[date] = None,
    exclude_doctor_id: Optional[str] = None,
    exclude_on_leave_between: Optional[tuple] = None,
) -> List[dict]:
    """List active doctors who are not on leave for the given date/range."""
    query = {"role": "doctor", "is_active": True}
    if specialization:
        query["specialization"] = specialization

    doctors = await db.users.find(query).to_list(length=200)
    available: List[dict] = []

    for doctor in doctors:
        did = str(doctor["_id"])
        if exclude_doctor_id and did == exclude_doctor_id:
            continue
        if exclude_on_leave_between:
            start, end = exclude_on_leave_between
            if await is_doctor_on_leave_between(db, did, start, end):
                continue
        elif await is_doctor_on_leave(db, did, check_date):
            continue
        available.append(doctor)

    return available
