"""Quick test script to check backend connection and MongoDB"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from passlib.context import CryptContext

async def test_connection():
    try:
        print("Testing MongoDB connection...")
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connected!")
        
        # Check users
        users_count = await db.users.count_documents({})
        print(f"📊 Users in database: {users_count}")
        
        if users_count == 0:
            print("\n⚠️  No users found. Creating test users...")
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            test_users = [
                {
                    "email": "patient@test.com",
                    "password": pwd_context.hash("patient123"),
                    "full_name": "Test Patient",
                    "phone": "+91 9876543210",
                    "role": "patient",
                    "is_active": True
                },
                {
                    "email": "doctor@test.com",
                    "password": pwd_context.hash("doctor123"),
                    "full_name": "Dr. Test Doctor",
                    "phone": "+91 9876543211",
                    "role": "doctor",
                    "is_active": True
                },
                {
                    "email": "admin@test.com",
                    "password": pwd_context.hash("admin123"),
                    "full_name": "Admin User",
                    "phone": "+91 9876543212",
                    "role": "admin",
                    "is_active": True
                }
            ]
            
            for user in test_users:
                existing = await db.users.find_one({"email": user["email"]})
                if not existing:
                    await db.users.insert_one(user)
                    print(f"✅ Created: {user['email']}")
                else:
                    print(f"⏭️  Exists: {user['email']}")
        
        client.close()
        print("\n✅ Test complete!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())


