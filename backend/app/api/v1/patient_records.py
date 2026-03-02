"""
Patient Records API
Store and retrieve patient disease parameters
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.api.v1.auth import oauth2_scheme, get_current_user
from app.models.patient_record import (
    DiabetesParameters,
    HeartDiseaseParameters,
    KidneyDiseaseParameters,
    PatientRecordCreate,
    PatientRecordResponse
)

router = APIRouter()

# Store disease parameters (without prediction)
@router.post("/store")
async def store_patient_parameters(
    patient_id: str,
    disease_type: Literal["diabetes", "heart_disease", "kidney_disease"],
    parameters: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Store patient disease parameters in database
    Can be called by patient themselves or by doctors/admins
    """
    try:
        # Check if user has permission
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        # Patients can only store their own records
        # Doctors and admins can store for any patient
        if user_role == "patient" and user_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only store your own records"
            )
        
        # Validate patient exists (convert string to ObjectId)
        try:
            patient_oid = ObjectId(patient_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid patient ID format"
            )
        
        patient = await db.users.find_one({"_id": patient_oid})
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Validate parameters based on disease type
        if disease_type == "diabetes":
            try:
                DiabetesParameters(**parameters)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid diabetes parameters: {str(e)}"
                )
        elif disease_type == "heart_disease":
            try:
                HeartDiseaseParameters(**parameters)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid heart disease parameters: {str(e)}"
                )
        elif disease_type == "kidney_disease":
            try:
                KidneyDiseaseParameters(**parameters)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid kidney disease parameters: {str(e)}"
                )
        
        # Create patient record
        patient_record = {
            "patient_id": patient_oid,  # Use ObjectId
            "disease_type": disease_type,
            "parameters": parameters,
            "created_by": ObjectId(user_id) if isinstance(user_id, str) else user_id,  # Who created this record
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = await db.patient_records.insert_one(patient_record)
        
        return {
            "success": True,
            "message": f"Patient {disease_type} parameters stored successfully",
            "record_id": str(result.inserted_id),
            "patient_id": patient_id,
            "disease_type": disease_type
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store patient record: {str(e)}"
        )

# Get patient records by patient ID
@router.get("/patient/{patient_id}")
async def get_patient_records(
    patient_id: str,
    disease_type: Optional[Literal["diabetes", "heart_disease", "kidney_disease"]] = None,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get all disease parameters for a specific patient
    """
    try:
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        # Convert patient_id to ObjectId
        try:
            patient_oid = ObjectId(patient_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid patient ID format"
            )
        
        # Convert user_id to ObjectId for comparison
        user_oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Check permissions
        if user_role == "patient" and user_oid != patient_oid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own records"
            )
        
        # Build query
        query = {"patient_id": patient_oid}
        if disease_type:
            query["disease_type"] = disease_type
        
        # Fetch records
        cursor = db.patient_records.find(query).sort("created_at", -1)
        records = await cursor.to_list(length=None)
        
        # Format response
        formatted_records = []
        for record in records:
            formatted_records.append({
                "id": str(record["_id"]),
                "patient_id": str(record["patient_id"]),
                "disease_type": record["disease_type"],
                "parameters": record["parameters"],
                "created_at": record["created_at"],
                "updated_at": record.get("updated_at"),
                "created_by": str(record.get("created_by")) if record.get("created_by") else None
            })
        
        return {
            "patient_id": patient_id,
            "disease_type": disease_type or "all",
            "records": formatted_records,
            "count": len(formatted_records)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve patient records: {str(e)}"
        )

# Get all records for current user (patient)
@router.get("/my-records")
async def get_my_records(
    disease_type: Optional[Literal["diabetes", "heart_disease", "kidney_disease"]] = None,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get all disease parameters for the current logged-in patient
    """
    try:
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This endpoint is only for patients"
            )
        
        # Convert user_id to ObjectId
        user_oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Build query
        query = {"patient_id": user_oid}
        if disease_type:
            query["disease_type"] = disease_type
        
        # Fetch records
        cursor = db.patient_records.find(query).sort("created_at", -1)
        records = await cursor.to_list(length=None)
        
        # Format response
        formatted_records = []
        for record in records:
            formatted_records.append({
                "id": str(record["_id"]),
                "disease_type": record["disease_type"],
                "parameters": record["parameters"],
                "created_at": record["created_at"],
                "updated_at": record.get("updated_at")
            })
        
        return {
            "patient_id": user_id,
            "disease_type": disease_type or "all",
            "records": formatted_records,
            "count": len(formatted_records)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve records: {str(e)}"
        )

# Update patient record
@router.put("/update/{record_id}")
async def update_patient_record(
    record_id: str,
    parameters: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Update patient disease parameters
    """
    try:
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        # Get existing record
        record = await db.patient_records.find_one({"_id": record_id})
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found"
            )
        
        # Check permissions
        patient_id = record["patient_id"]
        if user_role == "patient" and user_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own records"
            )
        
        # Validate parameters
        disease_type = record["disease_type"]
        if disease_type == "diabetes":
            DiabetesParameters(**parameters)
        elif disease_type == "heart_disease":
            HeartDiseaseParameters(**parameters)
        elif disease_type == "kidney_disease":
            KidneyDiseaseParameters(**parameters)
        
        # Update record
        update_data = {
            "parameters": parameters,
            "updated_at": datetime.utcnow(),
            "updated_by": user_oid
        }
        
        await db.patient_records.update_one(
            {"_id": record_oid},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Patient record updated successfully",
            "record_id": record_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update record: {str(e)}"
        )

# Delete patient record
@router.delete("/delete/{record_id}")
async def delete_patient_record(
    record_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Delete patient disease record
    """
    try:
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        # Get existing record
        record = await db.patient_records.find_one({"_id": record_id})
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found"
            )
        
        # Check permissions
        patient_id = record["patient_id"]
        if user_role == "patient" and user_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own records"
            )
        
        # Delete record
        await db.patient_records.delete_one({"_id": record_oid})
        
        return {
            "success": True,
            "message": "Patient record deleted successfully",
            "record_id": record_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete record: {str(e)}"
        )

# Get all patients' records (for doctors/admins)
@router.get("/all")
async def get_all_patient_records(
    disease_type: Optional[Literal["diabetes", "heart_disease", "kidney_disease"]] = None,
    patient_id: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get all patient records (for doctors and admins only)
    """
    try:
        user_role = current_user.get("role")
        
        if user_role not in ["doctor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors and admins can access all records"
            )
        
        # Build query
        query = {}
        if disease_type:
            query["disease_type"] = disease_type
        if patient_id:
            try:
                query["patient_id"] = ObjectId(patient_id)
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid patient ID format"
                )
        
        # Fetch records
        cursor = db.patient_records.find(query).sort("created_at", -1).limit(limit)
        records = await cursor.to_list(length=limit)
        
        # Format response with patient details
        formatted_records = []
        for record in records:
            # Get patient details
            patient = await db.users.find_one({"_id": record["patient_id"]})
            patient_name = patient.get("full_name", "Unknown") if patient else "Unknown"
            patient_email = patient.get("email", "") if patient else ""
            
            formatted_records.append({
                "id": str(record["_id"]),
                "patient_id": str(record["patient_id"]),
                "patient_name": patient_name,
                "patient_email": patient_email,
                "disease_type": record["disease_type"],
                "parameters": record["parameters"],
                "created_at": record["created_at"],
                "updated_at": record.get("updated_at")
            })
        
        return {
            "records": formatted_records,
            "count": len(formatted_records)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve records: {str(e)}"
        )

