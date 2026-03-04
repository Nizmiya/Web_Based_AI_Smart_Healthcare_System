"""Doctor leave/availability models."""
from pydantic import BaseModel
from typing import Optional
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
