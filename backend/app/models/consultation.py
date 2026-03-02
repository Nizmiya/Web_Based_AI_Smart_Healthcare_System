"""Consultation model for doctor-patient scheduling."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ConsultationStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class ConsultationCreate(BaseModel):
    patient_id: str
    scheduled_at: datetime
    notes: Optional[str] = None

class ConsultationUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    status: Optional[ConsultationStatus] = None
    notes: Optional[str] = None
