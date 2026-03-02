from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from typing import Optional

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None

db = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    if db.client is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail="Database not connected. Please check MongoDB is running and connection settings are correct."
        )
    return db.client[settings.DATABASE_NAME]

