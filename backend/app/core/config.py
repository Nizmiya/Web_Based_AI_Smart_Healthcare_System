from pydantic_settings import BaseSettings
from typing import List
from decouple import config
from pathlib import Path

# Always load backend/.env regardless of process working directory
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = config("MONGODB_URL", default="mongodb://localhost:27017/healthcare_db")
    DATABASE_NAME: str = config("DATABASE_NAME", default="healthcare_db")
    
    # Security
    SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = config(
        "BACKEND_CORS_ORIGINS",
        default='["http://localhost:3000"]',
        cast=lambda v: [origin.strip() for origin in v.strip("[]").replace('"', '').split(",")]
    )
    
    # Application
    APP_NAME: str = config("APP_NAME", default="Smart Healthcare System API")
    DEBUG: bool = config("DEBUG", default=True, cast=bool)
    
    # ML Models
    ML_MODELS_PATH: str = config("ML_MODELS_PATH", default="./ml_models")
    
    # Translation
    GOOGLE_TRANSLATE_API_KEY: str = config("GOOGLE_TRANSLATE_API_KEY", default="")

    # Gemini AI (optional) for recommendation generation
    GEMINI_API_KEY: str = config("GEMINI_API_KEY", default="")
    GEMINI_MODEL: str = config("GEMINI_MODEL", default="gemini-2.0-flash")
    
    # Email (SMTP) - for forgot password OTP
    MAIL_HOST: str = config("MAIL_HOST", default="smtp.gmail.com")
    MAIL_PORT: int = config("MAIL_PORT", default=587, cast=int)
    MAIL_USER: str = config("MAIL_USER", default="")
    MAIL_PASS: str = config("MAIL_PASS", default="")
    MAIL_FROM: str = config("MAIL_FROM", default="")
    MAIL_USE_SSL: bool = config("MAIL_USE_SSL", default=False, cast=bool)
    # false = OTP goes to user email inbox only (production flow)
    MAIL_DEV_MODE: bool = config("MAIL_DEV_MODE", default=False, cast=bool)
    
    class Config:
        env_file = str(_ENV_FILE)
        case_sensitive = True

settings = Settings()

