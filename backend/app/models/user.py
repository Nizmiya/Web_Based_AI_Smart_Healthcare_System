from pydantic import BaseModel, EmailStr, Field  # pyright: ignore[reportMissingImports]
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId  # pyright: ignore[reportMissingImports]

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Literal["patient", "doctor", "admin"]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ----- Forgot password flow -----
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str


class VerifyOTPResponse(BaseModel):
    reset_token: str
    email: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: Optional[str] = None
    otp_code: Optional[str] = None
    new_password: str = Field(..., min_length=6)

class PatientProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[list] = []
    allergies: Optional[list] = []
    current_medications: Optional[list] = []

class DoctorProfile(BaseModel):
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_id: Optional[str] = None
    experience_years: Optional[int] = None
    qualifications: Optional[list] = []

