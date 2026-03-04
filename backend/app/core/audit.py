"""Audit logging for doctor/admin access to patient data."""
from datetime import datetime
from typing import Optional

async def log_audit(
    db,
    user_id: str,
    role: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    details: Optional[dict] = None,
):
    """Append one entry to audit_logs collection. Call from endpoints that access sensitive data."""
    if role not in ("doctor", "admin"):
        return
    doc = {
        "user_id": user_id,
        "role": role,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "patient_id": patient_id,
        "details": details or {},
        "created_at": datetime.utcnow(),
    }
    await db.audit_logs.insert_one(doc)
