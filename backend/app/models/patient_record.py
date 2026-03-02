"""
Patient Record Models
Stores patient disease parameters for all 3 diseases
"""

from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

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

# Diabetes Parameters
class DiabetesParameters(BaseModel):
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree_function: float
    age: int

# Heart Disease Parameters
class HeartDiseaseParameters(BaseModel):
    age: int
    sex: int  # 0=Female, 1=Male
    chest_pain_type: int  # 0-3
    resting_bp: float
    serum_cholesterol: float
    fasting_blood_sugar: int  # 0 or 1
    resting_ecg: int  # 0-2
    max_heart_rate: float
    exercise_induced_angina: int  # 0 or 1
    st_depression: float
    slope: int  # 0-2
    num_major_vessels: int
    thalassemia: int  # 0-3

# Kidney Disease Parameters
class KidneyDiseaseParameters(BaseModel):
    age: int
    blood_pressure: float
    specific_gravity: float
    albumin: float
    sugar: float
    red_blood_cells: int  # 0 or 1
    pus_cell: int
    pus_cell_clumps: int
    bacteria: int
    blood_glucose_random: float
    blood_urea: float
    serum_creatinine: float
    sodium: float
    potassium: float
    hemoglobin: float
    packed_cell_volume: float
    white_blood_cell_count: float
    red_blood_cell_count: float
    hypertension: int
    diabetes_mellitus: int
    coronary_artery_disease: int
    appetite: int
    pedal_edema: int
    anemia: int

# Patient Record - stores disease parameters
class PatientRecordCreate(BaseModel):
    patient_id: str  # User ID of the patient
    disease_type: Literal["diabetes", "heart_disease", "kidney_disease"]
    parameters: dict  # Disease-specific parameters

class PatientRecordResponse(BaseModel):
    id: str
    patient_id: str
    disease_type: str
    parameters: dict
    prediction_result: Optional[dict] = None  # Stores prediction if available
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True















