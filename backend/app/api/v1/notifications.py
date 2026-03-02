from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.api.v1.auth import get_current_user
from datetime import datetime
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 50,
    db=Depends(get_database)
):
    """Get user notifications"""
    query = {"user_id": current_user["id"]}
    if unread_only:
        query["is_read"] = False
    
    cursor = db.notifications.find(query).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    for notif in notifications:
        notif["id"] = str(notif["_id"])
        notif.pop("_id", None)
    
    return {"notifications": notifications, "count": len(notifications)}

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"_id": notification_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    return {"message": "Notification marked as read"}

