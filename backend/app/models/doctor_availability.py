"""Doctor leave/availability models."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class DoctorLeaveCreate(BaseModel):
    from_date: date
    to_date: date
    reason: Optional[str] = None

class DoctorLeaveResponse(BaseModel):
    id: str
    doctor_id: str
    from_date: date
    to_date: date
    reason: Optional[str] = None
    created_at: Optional[str] = None

class BulkReassignRequest(BaseModel):
    from_doctor_id: str
    to_doctor_id: str
    patient_ids: Optional[List[str]] = None
    leave_id: Optional[str] = None
