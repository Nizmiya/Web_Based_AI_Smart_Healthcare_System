from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    VerifyOTPResponse,
    ResetPasswordRequest,
)
from app.core.database import get_database
from app.core.email_util import send_password_reset_otp_email
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings
import bcrypt
import uuid
import random
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# In-memory reset tokens for forgot-password flow (email -> token mapping)
reset_tokens: dict = {}

def verify_password(plain_password, hashed_password):
    """Verify password with error handling for invalid hash formats"""
    try:
        # Try passlib first
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError) as e:
        # If passlib fails, try direct bcrypt verification
        try:
            password_bytes = plain_password.encode('utf-8')
            hash_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except Exception as bcrypt_error:
            print(f"Password verification error: {str(e)}")
            print(f"Bcrypt fallback also failed: {str(bcrypt_error)}")
            return False
    except Exception as e:
        # Last resort: try direct bcrypt
        try:
            password_bytes = plain_password.encode('utf-8')
            hash_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except:
            print(f"Unexpected password verification error: {str(e)}")
            return False

def get_password_hash(password):
    """Hash password with bcrypt (max 72 bytes)"""
    # Bcrypt has a 72 byte limit
    # Convert to bytes and truncate if necessary
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Use bcrypt directly for more reliable hashing
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db=Depends(get_database)):
    """Register a new user - Only patients can register"""
    print(f"\n📝 Registration request received:")
    print(f"   Email: {user_data.email}")
    print(f"   Name: {user_data.full_name}")
    print(f"   Phone: {user_data.phone}")
    print(f"   Role: {user_data.role}")
    
    try:
        # Only allow patient registration
        if user_data.role != "patient":
            print(f"❌ Invalid role: {user_data.role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can register. Doctors must be added by admin."
            )
        
        # Check if user already exists
        print(f"🔍 Checking if user exists: {user_data.email}")
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            print(f"❌ User already exists: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        print(f"✅ User does not exist, creating new account...")
        
        # Create user - force role to patient
        user_dict = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "role": "patient",  # Force patient role
            "password": get_password_hash(user_data.password),
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert into database
        print(f"💾 Inserting user into database...")
        result = await db.users.insert_one(user_dict)
        
        # Verify insertion
        if not result.inserted_id:
            print(f"❌ Failed to insert user - no inserted_id")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        print(f"✅ User inserted with ID: {result.inserted_id}")
        
        user_dict["id"] = str(result.inserted_id)
        user_dict.pop("password", None)
        
        print(f"✅ User registered successfully: {user_data.email}")
        return UserResponse(**user_dict)
        
    except HTTPException as he:
        print(f"❌ HTTPException: {he.detail}")
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"❌ Registration error: {error_msg}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {error_msg}"
        )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_database)):
    """Login user"""
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
        
        user = await db.users.find_one({"email": form_data.username})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check password
        if not user.get("password"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(form_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"], "user_id": str(user["_id"])},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# ----- Forgot password (all users: patient, doctor, admin) -----

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db=Depends(get_database)):
    """Request password reset. Sends OTP to user's email."""
    logger.info("Forgot password request for email: %s", request.email)
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found with this email",
        )
    otp_code = str(random.randint(1000, 9999))
    now = datetime.utcnow()
    otp_doc = {
        "otp_id": str(uuid.uuid4()),
        "email": request.email,
        "otp_code": otp_code,
        "createdAt": now.isoformat(),
        "expiresAt": (now + timedelta(minutes=10)).isoformat(),
        "is_used": False,
    }
    await db.otps.insert_one(otp_doc)
    try:
        send_password_reset_otp_email(request.email, otp_code)
        logger.info("Password reset OTP sent to: %s", request.email)
    except Exception as e:
        logger.exception("Failed to send password reset OTP: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset OTP",
        ) from e
    return {"message": "Password reset OTP sent successfully to your email"}


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest, db=Depends(get_database)):
    """Verify OTP from email and return a reset token for reset-password."""
    logger.info("Verifying OTP for email: %s", request.email)
    valid_otps = await db.otps.find({"email": request.email, "is_used": False}).to_list(100)
    if not valid_otps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid OTP found for this email",
        )
    latest_otp = max(valid_otps, key=lambda x: x.get("createdAt", ""))
    now = datetime.utcnow()
    expires_at = datetime.fromisoformat(latest_otp["expiresAt"])
    if now > expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one.")
    if latest_otp["otp_code"] != request.otp_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code")
    await db.otps.update_one({"otp_id": latest_otp["otp_id"]}, {"$set": {"is_used": True}})
    reset_token = str(uuid.uuid4())
    reset_tokens[reset_token] = request.email
    return VerifyOTPResponse(reset_token=reset_token, email=request.email)


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db=Depends(get_database)):
    """Reset password using resetToken (from verify-otp) or otpCode."""
    logger.info("Password reset request for email: %s", request.email)
    email_from_token = None
    if request.reset_token:
        email_from_token = reset_tokens.get(request.reset_token)
        if not email_from_token or email_from_token != request.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token. Please verify OTP again.",
            )
    elif request.otp_code:
        valid_otps = await db.otps.find({"email": request.email, "is_used": False}).to_list(100)
        if not valid_otps:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid OTP found for this email",
            )
        latest_otp = max(valid_otps, key=lambda x: x.get("createdAt", ""))
        now = datetime.utcnow()
        expires_at = datetime.fromisoformat(latest_otp["expiresAt"])
        if now > expires_at:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one.")
        if latest_otp["otp_code"] != request.otp_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code")
        await db.otps.update_one({"otp_id": latest_otp["otp_id"]}, {"$set": {"is_used": True}})
        email_from_token = request.email
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either reset_token (from verify-otp) or otp_code (4-digit OTP from email)",
        )
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    now_iso = datetime.utcnow().isoformat()
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"password": get_password_hash(request.new_password), "updated_at": now_iso}},
    )
    if request.reset_token:
        reset_tokens.pop(request.reset_token, None)
    return {"message": "Password reset successfully"}


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_database)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Return dict for use in other endpoints
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "_id": user["_id"]
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    """Get current user profile"""
    user = await db.users.find_one({"_id": current_user["_id"]})
    if user:
        user["id"] = str(user["_id"])
        user.pop("password", None)
        return UserResponse(**user)
    raise HTTPException(status_code=404, detail="User not found")

