from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any, List
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.api.v1.auth import oauth2_scheme, get_current_user
import joblib
import os
import aiohttp
import re
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Ensure NumPy BitGenerator is available for unpickling models saved with older NumPy
try:
    import numpy.random._mt19937  # noqa: F401
except Exception:
    pass

router = APIRouter()

# Load ML Models (lazy loading)
models = {
    "diabetes": None,
    "heart_disease": None,
    "kidney_disease": None
}

FALLBACK_RECOMMENDATIONS = {
    "Low": [
        "Maintain a balanced diet with whole grains, vegetables, and lean proteins.",
        "Stay physically active with at least 150 minutes of moderate exercise weekly.",
        "Keep a healthy sleep routine and manage stress levels.",
        "Monitor key health metrics (weight, BP, glucose) periodically.",
        "Schedule routine checkups and follow preventive care guidance."
    ],
    "Medium": [
        "Consult a healthcare professional for personalized guidance.",
        "Reduce sugary, salty, and processed foods; focus on portion control.",
        "Increase physical activity gradually and aim for consistent routines.",
        "Track symptoms and risk factors to share during medical visits.",
        "Consider lab tests or screenings as advised by your clinician."
    ],
    "High": [
        "Seek medical advice soon for a detailed evaluation.",
        "Follow a structured care plan and adhere to prescribed medication.",
        "Avoid smoking and limit alcohol; prioritize heart-healthy nutrition.",
        "Monitor vital signs or relevant metrics as directed by a doctor.",
        "Arrange follow-up visits to track progress and adjust treatment."
    ],
    "Critical": [
        "Get immediate medical attention or emergency care if symptoms appear.",
        "Follow clinician instructions strictly and do not delay appointments.",
        "Avoid strenuous activity until cleared by a healthcare provider.",
        "Ensure close monitoring and support from family or caregivers.",
        "Prepare medical history and recent test results for urgent review."
    ]
}

# Replace URLs with curated YouTube links before production use.
VIDEO_RECOMMENDATIONS = {
    "diabetes": {
        "Low": [
            {
                "title": "Low risk: diabetes-friendly walking routine",
                "url": "https://www.youtube.com/watch?v=8BcPHWGQO44",
                "category": "exercise"
            },
            {
                "title": "Low risk: balanced plate for blood sugar",
                "url": "https://www.youtube.com/watch?v=J1St2D2fDtQ",
                "category": "food"
            }
        ],
        "Medium": [
            {
                "title": "Medium risk: beginner cardio for glucose control",
                "url": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
                "category": "exercise"
            },
            {
                "title": "Medium risk: meal planning for diabetes",
                "url": "https://www.youtube.com/watch?v=1G4isv_Fylg",
                "category": "food"
            }
        ],
        "High": [
            {
                "title": "High risk: gentle exercise plan (doctor-approved)",
                "url": "https://www.youtube.com/watch?v=VHyGqsPOUHs",
                "category": "exercise"
            },
            {
                "title": "High risk: reduce sugar and refined carbs",
                "url": "https://www.youtube.com/watch?v=of4j4E7uB64",
                "category": "food"
            }
        ],
        "Critical": [
            {
                "title": "Critical: safe activity basics (seek medical advice)",
                "url": "https://www.youtube.com/watch?v=6t8m3nLkP4M",
                "category": "exercise"
            },
            {
                "title": "Critical: diet steps while awaiting care",
                "url": "https://www.youtube.com/watch?v=QZbJz2V6Yp8",
                "category": "food"
            }
        ]
    },
    "heart_disease": {
        "Low": [
            {
                "title": "Low risk: heart-healthy aerobic routine",
                "url": "https://www.youtube.com/watch?v=2pLT-olgUJs",
                "category": "exercise"
            },
            {
                "title": "Low risk: Mediterranean diet basics",
                "url": "https://www.youtube.com/watch?v=V4jA8B3S2XU",
                "category": "food"
            }
        ],
        "Medium": [
            {
                "title": "Medium risk: safe cardio starter plan",
                "url": "https://www.youtube.com/watch?v=Yim4--J44gk",
                "category": "exercise"
            },
            {
                "title": "Medium risk: reduce salt and saturated fat",
                "url": "https://www.youtube.com/watch?v=zdG0-4pKWbg",
                "category": "food"
            }
        ],
        "High": [
            {
                "title": "High risk: low-impact exercise guidance",
                "url": "https://www.youtube.com/watch?v=2pLT-olgUJs",
                "category": "exercise"
            },
            {
                "title": "High risk: heart-healthy eating plan",
                "url": "https://www.youtube.com/watch?v=U8N5a7o1AbM",
                "category": "food"
            }
        ],
        "Critical": [
            {
                "title": "Critical: activity limits and safety tips",
                "url": "https://www.youtube.com/watch?v=5nZ1kD2C0dM",
                "category": "exercise"
            },
            {
                "title": "Critical: diet steps while awaiting care",
                "url": "https://www.youtube.com/watch?v=F1a2S6c8dE4",
                "category": "food"
            }
        ]
    },
    "kidney_disease": {
        "Low": [
            {
                "title": "Low risk: kidney-friendly walking routine",
                "url": "https://www.youtube.com/watch?v=8BcPHWGQO44",
                "category": "exercise"
            },
            {
                "title": "Low risk: kidney-friendly meal tips",
                "url": "https://www.youtube.com/watch?v=3C7M8t7g4G4",
                "category": "food"
            }
        ],
        "Medium": [
            {
                "title": "Medium risk: low-impact exercise plan",
                "url": "https://www.youtube.com/watch?v=9X7iZz1b0bQ",
                "category": "exercise"
            },
            {
                "title": "Medium risk: manage sodium and protein",
                "url": "https://www.youtube.com/watch?v=0nQ6o8bYt7g",
                "category": "food"
            }
        ],
        "High": [
            {
                "title": "High risk: gentle activity with medical guidance",
                "url": "https://www.youtube.com/watch?v=6t8m3nLkP4M",
                "category": "exercise"
            },
            {
                "title": "High risk: kidney-friendly diet planning",
                "url": "https://www.youtube.com/watch?v=cD3fI2fX3Yw",
                "category": "food"
            }
        ],
        "Critical": [
            {
                "title": "Critical: safe movement basics",
                "url": "https://www.youtube.com/watch?v=VHyGqsPOUHs",
                "category": "exercise"
            },
            {
                "title": "Critical: diet steps while awaiting care",
                "url": "https://www.youtube.com/watch?v=3C7M8t7g4G4",
                "category": "food"
            }
        ]
    },
    "generic": {
        "Low": [
            {
                "title": "Low risk: daily walking routine",
                "url": "https://www.youtube.com/watch?v=8BcPHWGQO44",
                "category": "exercise"
            },
            {
                "title": "Low risk: healthy plate guide",
                "url": "https://www.youtube.com/watch?v=J1St2D2fDtQ",
                "category": "food"
            }
        ],
        "Medium": [
            {
                "title": "Medium risk: gentle cardio plan",
                "url": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
                "category": "exercise"
            },
            {
                "title": "Medium risk: portion control basics",
                "url": "https://www.youtube.com/watch?v=1G4isv_Fylg",
                "category": "food"
            }
        ],
        "High": [
            {
                "title": "High risk: low-impact exercise guidance",
                "url": "https://www.youtube.com/watch?v=VHyGqsPOUHs",
                "category": "exercise"
            },
            {
                "title": "High risk: reduce sugar, salt, and saturated fat",
                "url": "https://www.youtube.com/watch?v=of4j4E7uB64",
                "category": "food"
            }
        ],
        "Critical": [
            {
                "title": "Critical: safe activity basics",
                "url": "https://www.youtube.com/watch?v=6t8m3nLkP4M",
                "category": "exercise"
            },
            {
                "title": "Critical: diet steps while awaiting care",
                "url": "https://www.youtube.com/watch?v=QZbJz2V6Yp8",
                "category": "food"
            }
        ]
    }
}

RISK_VIDEO_NOTES = {
    "Medium": "Check with a clinician if you have symptoms or concerns.",
    "High": "Consult a doctor before starting a new routine.",
    "Critical": "Seek medical care immediately; avoid strenuous activity unless cleared."
}

def get_recommendation_videos(disease_type: str, risk_level: str) -> List[Dict[str, Any]]:
    disease_key = disease_type if disease_type in VIDEO_RECOMMENDATIONS else "generic"
    risk_key = risk_level if risk_level in VIDEO_RECOMMENDATIONS[disease_key] else "Medium"
    base_videos = VIDEO_RECOMMENDATIONS[disease_key][risk_key]
    note = RISK_VIDEO_NOTES.get(risk_level)
    if not note:
        return base_videos
    return [{**video, "note": note} for video in base_videos]

def _load_threshold_from_json(disease_type: str) -> Optional[float]:
    """Load best threshold from threshold.json (saved by training notebook)."""
    try:
        import json
        path = os.path.join(settings.ML_MODELS_PATH, "threshold.json")
        if os.path.isfile(path):
            with open(path) as f:
                data = json.load(f)
            t = data.get(disease_type)
            if t is not None:
                return float(t)
    except Exception:
        pass
    return None

def _normalize_probability(value: Optional[float]) -> Optional[float]:
    if value is None:
        return None
    try:
        numeric = float(value)
    except Exception:
        return None
    # Normalize to 0-1 probability.
    if numeric > 1:
        numeric = numeric / 100.0
    if numeric < 0:
        return 0.0
    if numeric > 1:
        return 1.0
    return numeric

def get_risk_level(risk_value: float, disease_type: str, prediction: Optional[int] = None) -> str:
    """Map risk value to risk level. Uses only threshold.json (saved from training).
    If prediction=0 (No disease) -> Low. If prediction=1 (Yes): uses Youden threshold from threshold.json."""
    probability = _normalize_probability(risk_value)
    if probability is None:
        probability = 0.0

    if prediction is not None and prediction == 0:
        return "Low"

    best_threshold = _load_threshold_from_json(disease_type)
    if best_threshold is None:
        return "Medium"
    if probability < best_threshold:
        return "Medium"
    if probability < 0.8:
        return "High"
    return "Critical"

def _clean_recommendation_item(item: str) -> str:
    item = item.strip()
    item = re.sub(r"^[\s\-\*\d\.\)\:]+", "", item)
    return item.strip()


def _parse_recommendations(text: str) -> List[str]:
    if not text or not isinstance(text, str):
        return []
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if len(lines) <= 1:
        parts = [p.strip() for p in re.split(r"[;•\u2022]+", text) if p.strip()]
        lines = parts or lines
    cleaned = [_clean_recommendation_item(line) for line in lines]
    return [item for item in cleaned if item]


def _ensure_min_recommendations(items: List[str], risk_level: str) -> List[str]:
    fallback = FALLBACK_RECOMMENDATIONS.get(risk_level, FALLBACK_RECOMMENDATIONS["Medium"])
    merged = list(items)
    for candidate in fallback:
        if candidate not in merged:
            merged.append(candidate)
    if len(merged) < 5:
        merged.extend([f for f in fallback if f not in merged])
    return merged[:5]


def _normalize_model_name(name: str) -> str:
    if name.startswith("models/"):
        return name.split("/", 1)[1]
    return name


def _build_model_url(model_name: str) -> str:
    return (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
    )


async def _fetch_supported_models(session: aiohttp.ClientSession) -> List[str]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
    async with session.get(url) as response:
        if response.status != 200:
            return []
        data = await response.json()
    models = data.get("models", [])
    supported = [
        _normalize_model_name(model["name"])
        for model in models
        if "supportedGenerationMethods" in model
        and "generateContent" in model.get("supportedGenerationMethods", [])
    ]
    return [name for name in supported if name]


async def generate_ai_recommendation(
    disease_type: str,
    risk_level: str,
    risk_percentage: float,
    input_data: Dict[str, Any]
) -> List[str]:
    """Generate 5 short recommendations using Gemini. Falls back to static list."""
    if not settings.GEMINI_API_KEY:
        return _ensure_min_recommendations([], risk_level)

    prompt = (
        "You are a medical assistant. Provide exactly 5 short, non-diagnostic recommendations "
        "as a numbered list (1-5). Each item should be one sentence, avoid alarmist language, "
        "and suggest consulting a doctor for medium/high/critical risk.\n\n"
        f"Disease: {disease_type}\n"
        f"Risk level: {risk_level}\n"
        f"Risk percentage: {round(risk_percentage, 2)}\n"
        f"Parameters: {input_data}\n"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 256}
    }

    timeout = aiohttp.ClientTimeout(total=12)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            model_name = settings.GEMINI_MODEL
            async with session.post(_build_model_url(model_name), json=payload) as response:
                if response.status != 200:
                    if response.status == 404:
                        supported = await _fetch_supported_models(session)
                        if supported:
                            retry_model = supported[0]
                            async with session.post(
                                _build_model_url(retry_model),
                                json=payload
                            ) as retry_response:
                                if retry_response.status == 200:
                                    retry_data = await retry_response.json()
                                    retry_text = (
                                        retry_data.get("candidates", [{}])[0]
                                        .get("content", {})
                                        .get("parts", [{}])[0]
                                        .get("text")
                                    )
                                    if retry_text and isinstance(retry_text, str):
                                        parsed = _parse_recommendations(retry_text)
                                        return _ensure_min_recommendations(parsed, risk_level)
                    return _ensure_min_recommendations([], risk_level)
                data = await response.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text")
                )
                if text and isinstance(text, str):
                    parsed = _parse_recommendations(text)
                    return _ensure_min_recommendations(parsed, risk_level)
    except Exception:
        return _ensure_min_recommendations([], risk_level)

    return _ensure_min_recommendations([], risk_level)

def _ensure_numpy_pickle_compat():
    """Allow loading pickles saved with NumPy 2.x when running NumPy 1.x (numpy._core.*)."""
    import sys
    import types
    if "numpy._core.multiarray" in sys.modules:
        return
    try:
        import numpy.core.multiarray as _multiarray
        import numpy.core.numeric as _numeric
    except ImportError:
        return
    try:
        import numpy.core.umath as _umath
    except ImportError:
        _umath = _multiarray  # fallback
    if "numpy._core" not in sys.modules:
        _core = types.ModuleType("numpy._core")
        _core.__path__ = []  # so Python treats it as a package
        _core.multiarray = _multiarray
        _core.numeric = _numeric
        _core.umath = _umath
        sys.modules["numpy._core"] = _core
    sys.modules["numpy._core.multiarray"] = _multiarray
    sys.modules["numpy._core.numeric"] = _numeric
    sys.modules["numpy._core.umath"] = _umath

def _ensure_numpy_bitgenerator_compat():
    """Register NumPy BitGenerator so pickles from different NumPy versions can load."""
    import sys
    import types
    try:
        import numpy.random._mt19937 as _mt19937
        from numpy.random import _pickle as _np_pickle
    except ImportError:
        return
    mt_cls = getattr(_mt19937, "MT19937", None)
    if mt_cls is None:
        return
    if hasattr(_np_pickle, "BitGenerators"):
        _np_pickle.BitGenerators[mt_cls] = mt_cls
        _np_pickle.BitGenerators["numpy.random._mt19937.MT19937"] = mt_cls
        _np_pickle.BitGenerators["MT19937"] = mt_cls
    # If unpickler passes the class type, numpy's __bit_generator_ctor rejects it; patch to accept it
    if hasattr(_np_pickle, "__bit_generator_ctor"):
        _orig = _np_pickle.__bit_generator_ctor

        def _patched_ctor(bit_generator_name="MT19937"):
            if isinstance(bit_generator_name, type) and "MT19937" in (getattr(bit_generator_name, "__name__", "") or ""):
                return mt_cls()
            return _orig(bit_generator_name)

        _np_pickle.__bit_generator_ctor = _patched_ctor
    if "numpy.random.bit_generator" not in sys.modules:
        bit_gen = types.ModuleType("numpy.random.bit_generator")
        bit_gen.MT19937 = mt_cls
        sys.modules["numpy.random.bit_generator"] = bit_gen

def load_model(disease_type: str):
    """Load ML model for a disease type with scikit-learn compatibility fix"""
    if models[disease_type] is None:
        model_path = os.path.join(settings.ML_MODELS_PATH, f"{disease_type}_model.pkl")
        if os.path.exists(model_path):
            _ensure_numpy_pickle_compat()
            _ensure_numpy_bitgenerator_compat()
            try:
                models[disease_type] = joblib.load(model_path)
            except (AttributeError, ModuleNotFoundError, ImportError, ValueError, TypeError) as e:
                # Handle scikit-learn version compatibility issues
                import warnings
                warnings.filterwarnings('ignore')
                
                # Try loading with different scikit-learn versions
                try:
                    # Method 1: Try with compatibility mode
                    import pickle
                    import sys
                    
                    # Temporarily add compatibility shim
                    if 'sklearn._loss._loss' in str(e) or '__pyx_unpickle' in str(e):
                        # This is a scikit-learn version mismatch
                        # Try to load with custom unpickler
                        with open(model_path, 'rb') as f:
                            # Use joblib with custom unpickler
                            models[disease_type] = joblib.load(f)
                    else:
                        raise e
                except Exception as e2:
                    # If still fails, provide helpful error message
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail=f"Model loading failed due to scikit-learn version mismatch. Error: {str(e)}. Please retrain the model with current scikit-learn version (1.3.2) or update scikit-learn to match the training version."
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model for {disease_type} not found. Please train the model first."
            )
    return models[disease_type]

def load_scaler(disease_type: str):
    """Load scaler for a disease type if it exists"""
    scaler_path = os.path.join(settings.ML_MODELS_PATH, f"{disease_type}_scaler.pkl")
    if os.path.exists(scaler_path):
        return joblib.load(scaler_path)
    return None

def load_encoders(disease_type: str):
    """Load label encoders for a disease type if they exist"""
    encoders_path = os.path.join(settings.ML_MODELS_PATH, f"{disease_type}_encoders.pkl")
    if os.path.exists(encoders_path):
        return joblib.load(encoders_path)
    return None

# Prediction Schemas
class DiabetesPrediction(BaseModel):
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree_function: float
    age: int

class HeartDiseasePrediction(BaseModel):
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

class KidneyDiseasePrediction(BaseModel):
    age: int
    blood_pressure: float
    specific_gravity: float
    albumin: float
    sugar: float
    red_blood_cells: str
    pus_cell: str
    pus_cell_clumps: str
    bacteria: str
    blood_glucose_random: float
    blood_urea: float
    serum_creatinine: float
    sodium: float
    potassium: float
    hemoglobin: float
    packed_cell_volume: float
    white_blood_cell_count: float
    red_blood_cell_count: float
    hypertension: str
    diabetes_mellitus: str
    coronary_artery_disease: str
    appetite: str
    pedal_edema: str
    anemia: str

class DoctorReviewRequest(BaseModel):
    comment: str
    send_to_patient: bool = True

@router.post("/diabetes")
async def predict_diabetes(
    prediction_data: DiabetesPrediction,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Predict diabetes risk"""
    try:
        model = load_model("diabetes")
        
        # Prepare input data
        input_data = [[
            prediction_data.pregnancies,
            prediction_data.glucose,
            prediction_data.blood_pressure,
            prediction_data.skin_thickness,
            prediction_data.insulin,
            prediction_data.bmi,
            prediction_data.diabetes_pedigree_function,
            prediction_data.age
        ]]
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        risk_percentage = probability[1] * 100 if len(probability) > 1 else probability[0] * 100
        
        # Determine risk level (prediction=0 -> Low; prediction=1 -> use threshold.json or config)
        risk_level = get_risk_level(risk_percentage, "diabetes", prediction=int(prediction))

        # Generate recommendation using AI (fallback if unavailable)
        recommendation = await generate_ai_recommendation(
            "diabetes",
            risk_level,
            risk_percentage,
            prediction_data.dict()
        )
        video_recommendations = get_recommendation_videos("diabetes", risk_level)
        
        # Save prediction to database
        prediction_record = {
            "user_id": current_user["id"],
            "disease_type": "diabetes",
            "input_data": prediction_data.dict(),
            "prediction": int(prediction),
            "risk_percentage": float(risk_percentage),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "reviewed": False,
            "video_recommendations": video_recommendations,
            "created_at": datetime.utcnow()
        }
        
        prediction_id = await db.predictions.insert_one(prediction_record)
        
        # Also save to patient_records collection
        user_oid = ObjectId(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
        patient_record = {
            "patient_id": user_oid,
            "disease_type": "diabetes",
            "parameters": prediction_data.dict(),
            "prediction_result": {
                "prediction": int(prediction),
                "risk_percentage": float(risk_percentage),
                "risk_level": risk_level,
                "recommendation": recommendation,
                "confidence": round(max(probability) * 100, 2),
                "video_recommendations": video_recommendations
            },
            "created_by": user_oid,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.patient_records.insert_one(patient_record)
        
        # Create notifications for high risk predictions
        if risk_level in ["High", "Critical"]:
            disease_name = "diabetes"
            # Notify patient
            patient_notification = {
                "user_id": current_user["id"],
                "type": "high_risk",
                "title": f"High Risk Alert - {risk_level} Risk",
                "message": f"Your {disease_name.replace('_', ' ').title()} prediction shows {risk_level.lower()} risk ({round(risk_percentage, 2)}%). Please consult with a doctor.",
                "is_read": False,
                "created_at": datetime.utcnow(),
                "prediction_id": str(prediction_id.inserted_id)
            }
            await db.notifications.insert_one(patient_notification)
            
            # Notify all doctors
            doctors = await db.users.find({"role": "doctor"}).to_list(length=None)
            for doctor in doctors:
                doctor_notification = {
                    "user_id": doctor["_id"],
                    "type": "high_risk",
                    "title": f"High Risk Patient Alert",
                    "message": f"Patient {current_user.get('full_name', 'Unknown')} has {risk_level.lower()} risk ({round(risk_percentage, 2)}%) for {disease_name.replace('_', ' ').title()}. Review required.",
                    "is_read": False,
                    "created_at": datetime.utcnow(),
                    "prediction_id": str(prediction_id.inserted_id),
                    "patient_id": current_user["id"]
                }
                await db.notifications.insert_one(doctor_notification)
        
        return {
            "prediction": "Positive" if prediction == 1 else "Negative",
            "risk_percentage": round(risk_percentage, 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "confidence": round(max(probability) * 100, 2),
            "video_recommendations": video_recommendations
        }
    
    except Exception as e:
        logger.exception("Heart disease prediction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/heart-disease")
async def predict_heart_disease(
    prediction_data: HeartDiseasePrediction,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Predict heart disease risk"""
    try:
        model = load_model("heart_disease")
        scaler = load_scaler("heart_disease")
        
        # Prepare input data
        input_data = [[
            prediction_data.age,
            prediction_data.sex,
            prediction_data.chest_pain_type,
            prediction_data.resting_bp,
            prediction_data.serum_cholesterol,
            prediction_data.fasting_blood_sugar,
            prediction_data.resting_ecg,
            prediction_data.max_heart_rate,
            prediction_data.exercise_induced_angina,
            prediction_data.st_depression,
            prediction_data.slope,
            prediction_data.num_major_vessels,
            prediction_data.thalassemia
        ]]
        
        # Scale if scaler exists
        if scaler is not None:
            input_data = scaler.transform(input_data)
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        risk_percentage = probability[1] * 100 if len(probability) > 1 else probability[0] * 100
        
        # Determine risk level (prediction=0 -> Low; prediction=1 -> use threshold.json or config)
        risk_level = get_risk_level(risk_percentage, "heart_disease", prediction=int(prediction))

        # Generate recommendation using AI (fallback if unavailable)
        recommendation = await generate_ai_recommendation(
            "heart_disease",
            risk_level,
            risk_percentage,
            prediction_data.dict()
        )
        video_recommendations = get_recommendation_videos("heart_disease", risk_level)
        
        # Save prediction to database
        prediction_record = {
            "user_id": current_user["id"],
            "disease_type": "heart_disease",
            "input_data": prediction_data.dict(),
            "prediction": int(prediction),
            "risk_percentage": float(risk_percentage),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "reviewed": False,
            "video_recommendations": video_recommendations,
            "created_at": datetime.utcnow()
        }
        
        prediction_id = await db.predictions.insert_one(prediction_record)
        
        # Also save to patient_records collection
        user_oid = ObjectId(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
        patient_record = {
            "patient_id": user_oid,
            "disease_type": "heart_disease",
            "parameters": prediction_data.dict(),
            "prediction_result": {
                "prediction": int(prediction),
                "risk_percentage": float(risk_percentage),
                "risk_level": risk_level,
                "recommendation": recommendation,
                "confidence": round(max(probability) * 100, 2),
                "video_recommendations": video_recommendations
            },
            "created_by": user_oid,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.patient_records.insert_one(patient_record)
        
        # Create notifications for high risk predictions
        if risk_level in ["High", "Critical"]:
            disease_name = "heart_disease"
            # Notify patient
            patient_notification = {
                "user_id": current_user["id"],
                "type": "high_risk",
                "title": f"High Risk Alert - {risk_level} Risk",
                "message": f"Your {disease_name.replace('_', ' ').title()} prediction shows {risk_level.lower()} risk ({round(risk_percentage, 2)}%). Please consult with a doctor.",
                "is_read": False,
                "created_at": datetime.utcnow(),
                "prediction_id": str(prediction_id.inserted_id)
            }
            await db.notifications.insert_one(patient_notification)
            
            # Notify all doctors
            doctors = await db.users.find({"role": "doctor"}).to_list(length=None)
            for doctor in doctors:
                doctor_notification = {
                    "user_id": doctor["_id"],
                    "type": "high_risk",
                    "title": f"High Risk Patient Alert",
                    "message": f"Patient {current_user.get('full_name', 'Unknown')} has {risk_level.lower()} risk ({round(risk_percentage, 2)}%) for {disease_name.replace('_', ' ').title()}. Review required.",
                    "is_read": False,
                    "created_at": datetime.utcnow(),
                    "prediction_id": str(prediction_id.inserted_id),
                    "patient_id": current_user["id"]
                }
                await db.notifications.insert_one(doctor_notification)
        
        return {
            "prediction": "Positive" if prediction == 1 else "Negative",
            "risk_percentage": round(risk_percentage, 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "confidence": round(max(probability) * 100, 2),
            "video_recommendations": video_recommendations
        }
    
    except Exception as e:
        logger.exception("Heart disease prediction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/kidney-disease")
async def predict_kidney_disease(
    prediction_data: KidneyDiseasePrediction,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Predict kidney disease risk"""
    try:
        model = load_model("kidney_disease")
        scaler = load_scaler("kidney_disease")
        encoders = load_encoders("kidney_disease")

        if encoders is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kidney disease encoders not found. Re-train and save encoders."
            )

        raw_features = {
            "age": prediction_data.age,
            "bp": prediction_data.blood_pressure,
            "sg": prediction_data.specific_gravity,
            "al": prediction_data.albumin,
            "su": prediction_data.sugar,
            "rbc": prediction_data.red_blood_cells,
            "pc": prediction_data.pus_cell,
            "pcc": prediction_data.pus_cell_clumps,
            "ba": prediction_data.bacteria,
            "bgr": prediction_data.blood_glucose_random,
            "bu": prediction_data.blood_urea,
            "sc": prediction_data.serum_creatinine,
            "sod": prediction_data.sodium,
            "pot": prediction_data.potassium,
            "hemo": prediction_data.hemoglobin,
            "pcv": prediction_data.packed_cell_volume,
            "wc": prediction_data.white_blood_cell_count,
            "rc": prediction_data.red_blood_cell_count,
            "htn": prediction_data.hypertension,
            "dm": prediction_data.diabetes_mellitus,
            "cad": prediction_data.coronary_artery_disease,
            "appet": prediction_data.appetite,
            "pe": prediction_data.pedal_edema,
            "ane": prediction_data.anemia
        }

        categorical_cols = ["rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane"]
        for col in categorical_cols:
            if col in encoders:
                encoder = encoders[col]
                value = str(raw_features[col]).strip().lower()
                if value in encoder.classes_:
                    raw_features[col] = int(encoder.transform([value])[0])
                else:
                    raw_features[col] = -1

        feature_order = [
            "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc", "ba", "bgr", "bu", "sc",
            "sod", "pot", "hemo", "pcv", "wc", "rc", "htn", "dm", "cad", "appet", "pe", "ane"
        ]
        input_data = [[raw_features[name] for name in feature_order]]
        
        # Scale if scaler exists
        if scaler is not None:
            input_data = scaler.transform(input_data)
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        risk_percentage = probability[1] * 100 if len(probability) > 1 else probability[0] * 100
        
        # Determine risk level (prediction=0 -> Low; prediction=1 -> use threshold.json or config)
        risk_level = get_risk_level(risk_percentage, "kidney_disease", prediction=int(prediction))

        # Generate recommendation using AI (fallback if unavailable)
        recommendation = await generate_ai_recommendation(
            "kidney_disease",
            risk_level,
            risk_percentage,
            prediction_data.dict()
        )
        video_recommendations = get_recommendation_videos("kidney_disease", risk_level)
        
        # Save prediction to database
        prediction_record = {
            "user_id": current_user["id"],
            "disease_type": "kidney_disease",
            "input_data": prediction_data.dict(),
            "prediction": int(prediction),
            "risk_percentage": float(risk_percentage),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "reviewed": False,
            "video_recommendations": video_recommendations,
            "created_at": datetime.utcnow()
        }
        
        prediction_id = await db.predictions.insert_one(prediction_record)
        
        # Also save to patient_records collection
        user_oid = ObjectId(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
        patient_record = {
            "patient_id": user_oid,
            "disease_type": "kidney_disease",
            "parameters": prediction_data.dict(),
            "prediction_result": {
                "prediction": int(prediction),
                "risk_percentage": float(risk_percentage),
                "risk_level": risk_level,
                "recommendation": recommendation,
                "confidence": round(max(probability) * 100, 2),
                "video_recommendations": video_recommendations
            },
            "created_by": user_oid,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.patient_records.insert_one(patient_record)
        
        # Create notifications for high risk predictions
        if risk_level in ["High", "Critical"]:
            disease_name = "kidney_disease"
            # Notify patient
            patient_notification = {
                "user_id": current_user["id"],
                "type": "high_risk",
                "title": f"High Risk Alert - {risk_level} Risk",
                "message": f"Your {disease_name.replace('_', ' ').title()} prediction shows {risk_level.lower()} risk ({round(risk_percentage, 2)}%). Please consult with a doctor.",
                "is_read": False,
                "created_at": datetime.utcnow(),
                "prediction_id": str(prediction_id.inserted_id)
            }
            await db.notifications.insert_one(patient_notification)
            
            # Notify all doctors
            doctors = await db.users.find({"role": "doctor"}).to_list(length=None)
            for doctor in doctors:
                doctor_notification = {
                    "user_id": doctor["_id"],
                    "type": "high_risk",
                    "title": f"High Risk Patient Alert",
                    "message": f"Patient {current_user.get('full_name', 'Unknown')} has {risk_level.lower()} risk ({round(risk_percentage, 2)}%) for {disease_name.replace('_', ' ').title()}. Review required.",
                    "is_read": False,
                    "created_at": datetime.utcnow(),
                    "prediction_id": str(prediction_id.inserted_id),
                    "patient_id": current_user["id"]
                }
                await db.notifications.insert_one(doctor_notification)
        
        return {
            "prediction": "Positive" if prediction == 1 else "Negative",
            "risk_percentage": round(risk_percentage, 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "confidence": round(max(probability) * 100, 2),
            "video_recommendations": video_recommendations
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/history")
async def get_prediction_history(
    current_user: dict = Depends(get_current_user),
    disease_type: Optional[str] = None,
    limit: int = 50,
    db=Depends(get_database)
):
    """Get user's prediction history"""
    query = {"user_id": current_user["id"]}
    if disease_type:
        query["disease_type"] = disease_type
    
    total_count = await db.predictions.count_documents(query)
    cursor = db.predictions.find(query).sort("created_at", -1).limit(limit)
    predictions = await cursor.to_list(length=limit)
    
    for pred in predictions:
        pred["id"] = str(pred["_id"])
        pred.pop("_id", None)
        probability = _normalize_probability(pred.get("risk_percentage"))
        if probability is not None:
            pred["risk_percentage"] = round(probability * 100.0, 2)
            pred["risk_level"] = get_risk_level(
                probability,
                pred.get("disease_type", "default"),
                prediction=int(pred.get("prediction")) if pred.get("prediction") is not None else None
            )
    
    return {"predictions": predictions, "count": total_count}

@router.get("/all")
async def get_all_predictions(
    current_user: dict = Depends(get_current_user),
    risk_level: Optional[str] = None,
    disease_type: Optional[str] = None,
    reviewed: Optional[bool] = None,
    limit: int = 100,
    db=Depends(get_database)
):
    """Get all predictions (for doctors and admins)"""
    # Check if user is doctor or admin
    if current_user.get("role") not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can access all predictions"
        )
    
    query = {}
    if risk_level:
        query["risk_level"] = risk_level
    if disease_type:
        query["disease_type"] = disease_type
    if reviewed is True:
        query["reviewed"] = True
    if reviewed is False:
        query["$or"] = [{"reviewed": False}, {"reviewed": {"$exists": False}}]
    
    total_count = await db.predictions.count_documents(query)
    cursor = db.predictions.find(query).sort("created_at", -1).limit(limit)
    predictions = await cursor.to_list(length=limit)
    
    # Get user details for each prediction
    for pred in predictions:
        pred["id"] = str(pred["_id"])
        user_id = pred.get("user_id")
        if user_id:
            user_query_id = user_id
            if isinstance(user_id, str):
                try:
                    user_query_id = ObjectId(user_id)
                except Exception:
                    user_query_id = user_id
            user = await db.users.find_one({"_id": user_query_id})
            if user:
                pred["patient_name"] = user.get("full_name", "Unknown")
                pred["patient_email"] = user.get("email", "")
        pred.pop("_id", None)
        probability = _normalize_probability(pred.get("risk_percentage"))
        if probability is not None:
            pred["risk_percentage"] = round(probability * 100.0, 2)
            pred["risk_level"] = get_risk_level(
                probability,
                pred.get("disease_type", "default"),
                prediction=int(pred.get("prediction")) if pred.get("prediction") is not None else None
            )
    
    return {"predictions": predictions, "count": total_count}

@router.post("/{prediction_id}/review")
async def add_doctor_review(
    prediction_id: str,
    review: DoctorReviewRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Add doctor review/comment to a prediction and optionally notify patient."""
    if current_user.get("role") not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can add reviews"
        )

    try:
        pred_oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction id"
        )

    prediction = await db.predictions.find_one({"_id": pred_oid})
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )

    doctor_review = {
        "doctor_id": current_user["id"],
        "doctor_name": current_user.get("full_name", "Doctor"),
        "comment": review.comment.strip(),
        "reviewed_at": datetime.utcnow()
    }

    await db.predictions.update_one(
        {"_id": pred_oid},
        {"$set": {"doctor_review": doctor_review, "reviewed": True}}
    )

    if review.send_to_patient:
        patient_id = prediction.get("user_id")
        if patient_id:
            notification = {
                "user_id": patient_id,
                "type": "doctor_review",
                "title": "Doctor Review Available",
                "message": f"{doctor_review['doctor_name']} reviewed your {prediction.get('disease_type', 'prediction').replace('_', ' ')} result.",
                "is_read": False,
                "created_at": datetime.utcnow(),
                "prediction_id": prediction_id
            }
            await db.notifications.insert_one(notification)

    return {"message": "Review saved"}

