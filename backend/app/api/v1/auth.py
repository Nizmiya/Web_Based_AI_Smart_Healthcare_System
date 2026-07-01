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
from app.core.user_utils import find_user_by_email, normalize_email, registration_blocked_message
from app.core.email_util import send_password_reset_otp_email, is_mail_configured
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings
import bcrypt
import uuid
import random
import logging
from pymongo.errors import DuplicateKeyError

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
        
        email = normalize_email(user_data.email)

        # Check if user already exists (case-insensitive)
        print(f"🔍 Checking if user exists: {email}")
        existing_user = await find_user_by_email(db, email)
        if existing_user:
            print(f"❌ User already exists: {email} (role={existing_user.get('role')})")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=registration_blocked_message(existing_user),
            )

        print(f"✅ User does not exist, creating new account...")

        # Create user - force role to patient
        user_dict = {
            "email": email,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "role": "patient",  # Force patient role
            "password": get_password_hash(user_data.password),
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        if user_data.address is not None and user_data.address.strip():
            user_dict["address"] = user_data.address.strip()
        
        # Insert into database
        print(f"💾 Inserting user into database...")
        try:
            result = await db.users.insert_one(user_dict)
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please login or use Forgot Password.",
            )
        
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
        
        print(f"✅ User registered successfully: {email}")
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
        
        email = normalize_email(form_data.username)
        user = await find_user_by_email(db, email)
        
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
        
        user_payload = {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
        if user.get("specialization"):
            user_payload["specialization"] = user["specialization"]

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_payload,
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
    try:
        email = normalize_email(request.email)
        logger.info("Forgot password request for email: %s", email)
        user = await find_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found with this email",
            )

        otp_code = str(random.randint(1000, 9999))
        now = datetime.utcnow()
        otp_doc = {
            "otp_id": str(uuid.uuid4()),
            "email": email,
            "otp_code": otp_code,
            "createdAt": now.isoformat(),
            "expiresAt": (now + timedelta(minutes=10)).isoformat(),
            "is_used": False,
        }
        await db.otps.insert_one(otp_doc)

        mail_sent = False
        mail_error = None
        if is_mail_configured():
            try:
                send_password_reset_otp_email(email, otp_code)
                mail_sent = True
                logger.info("Password reset OTP sent to: %s", email)
            except Exception as e:
                mail_error = str(e)
                logger.exception("SMTP send failed for %s: %s", email, e)

        if mail_sent:
            return {
                "message": f"Password reset OTP sent to {email}. Please check your inbox.",
                "sent_to": email,
            }

        # SMTP configured but failed — optional screen fallback
        if settings.MAIL_DEV_MODE and mail_error:
            banner = f"PASSWORD RESET OTP for {email}: {otp_code}"
            logger.warning("SMTP failed, MAIL_DEV_MODE fallback. %s", banner)
            print(f"\n{'=' * 60}\n{banner}\n{'=' * 60}\n")
            return {
                "message": f"Email failed. Dev OTP shown on screen.",
                "dev_otp": otp_code,
                "dev_mode": True,
                "sent_to": email,
            }

        # No SMTP configured — optional screen OTP for local testing
        if settings.MAIL_DEV_MODE and not is_mail_configured():
            banner = f"PASSWORD RESET OTP for {email}: {otp_code}"
            logger.warning("MAIL_DEV_MODE — SMTP not configured. %s", banner)
            print(f"\n{'=' * 60}\n{banner}\n{'=' * 60}\n")
            return {
                "message": "DEV: OTP shown on screen (SMTP not configured).",
                "dev_otp": otp_code,
                "dev_mode": True,
                "sent_to": email,
            }

        if mail_error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=mail_error,
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Email not configured. Set MAIL_USER and MAIL_PASS (Gmail App Password) "
                "in backend/.env, then restart backend."
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Forgot password failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send password reset OTP: {str(e)}",
        ) from e


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest, db=Depends(get_database)):
    """Verify OTP from email and return a reset token for reset-password."""
    email = normalize_email(request.email)
    logger.info("Verifying OTP for email: %s", email)
    valid_otps = await db.otps.find({"email": email, "is_used": False}).to_list(100)
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
    reset_tokens[reset_token] = email
    return VerifyOTPResponse(reset_token=reset_token, email=email)


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db=Depends(get_database)):
    """Reset password using resetToken (from verify-otp) or otpCode."""
    email = normalize_email(request.email)
    logger.info("Password reset request for email: %s", email)
    email_from_token = None
    if request.reset_token:
        email_from_token = reset_tokens.get(request.reset_token)
        if not email_from_token or email_from_token != email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token. Please verify OTP again.",
            )
    elif request.otp_code:
        valid_otps = await db.otps.find({"email": email, "is_used": False}).to_list(100)
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
        email_from_token = email
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either reset_token (from verify-otp) or otp_code (4-digit OTP from email)",
        )
    user = await find_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    now_iso = datetime.utcnow().isoformat()
    await db.users.update_one(
        {"_id": user["_id"]},
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

