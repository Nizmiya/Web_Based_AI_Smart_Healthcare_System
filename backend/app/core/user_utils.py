"""Shared user lookup helpers."""
import re
from typing import Any, Dict, Optional


def normalize_email(email: str) -> str:
    return email.strip().lower()


async def find_user_by_email(db, email: str) -> Optional[Dict[str, Any]]:
    """Find user by email (case-insensitive for legacy records)."""
    normalized = normalize_email(email)
    user = await db.users.find_one({"email": normalized})
    if user:
        return user
    return await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(normalized)}$", "$options": "i"}}
    )


def registration_blocked_message(existing: Dict[str, Any]) -> str:
    role = existing.get("role", "user")
    if role == "doctor":
        return (
            "This email is already registered as a doctor account. "
            "Please use a different email to register as a patient."
        )
    if role == "admin":
        return (
            "This email is already registered as an admin account. "
            "Please use a different email."
        )
    if not existing.get("is_active", True):
        return (
            "This email was registered before but the account is inactive. "
            "Please contact admin or use Forgot Password to recover access."
        )
    return "Email already registered. Please login or use Forgot Password."
