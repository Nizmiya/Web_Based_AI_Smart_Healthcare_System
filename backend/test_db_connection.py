"""
Quick script to test MongoDB connection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def test_connection():
    try:
        print(f"Attempting to connect to: {settings.MONGODB_URL}")
        print(f"Database name: {settings.DATABASE_NAME}")
        
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database
        db = client[settings.DATABASE_NAME]
        
        # Test database access
        collections = await db.list_collection_names()
        print(f"✅ Database accessible. Collections: {collections}")
        
        # Check users collection
        user_count = await db.users.count_documents({})
        print(f"✅ Users collection exists. Total users: {user_count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure MongoDB is running")
        print("2. Check if MongoDB URL is correct:", settings.MONGODB_URL)
        print("3. Try: mongod --version (to check if MongoDB is installed)")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    exit(0 if result else 1)

