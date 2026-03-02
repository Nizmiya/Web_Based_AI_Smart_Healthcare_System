"""
Check MongoDB database connection and collections
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def check_database():
    """Check database connection and show collections"""
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        
        print("="*60)
        print("MongoDB Database Check")
        print("="*60)
        print(f"\nConnection URL: {settings.MONGODB_URL}")
        print(f"Database Name: {settings.DATABASE_NAME}")
        
        # Test connection
        await client.admin.command('ping')
        print("\n✅ MongoDB Connection: SUCCESS")
        
        # List collections
        collections = await db.list_collection_names()
        
        if collections:
            print(f"\n📁 Collections found: {len(collections)}")
            print("-" * 60)
            
            for collection_name in collections:
                count = await db[collection_name].count_documents({})
                print(f"  {collection_name:20s} : {count:5d} documents")
        else:
            print("\n⚠️  No collections found. Database is empty.")
            print("   Run 'python create_database.py' to create collections")
        
        # Show database stats
        stats = await db.command("dbStats")
        print("\n" + "-" * 60)
        print("Database Statistics:")
        print(f"  Collections: {stats.get('collections', 0)}")
        print(f"  Documents: {stats.get('objects', 0)}")
        print(f"  Data Size: {stats.get('dataSize', 0)} bytes")
        print(f"  Storage Size: {stats.get('storageSize', 0)} bytes")
        
        print("\n" + "="*60)
        print("✅ Database check complete!")
        print("\nTo view in MongoDB Compass:")
        print(f"  Connection String: {settings.MONGODB_URL}")
        print(f"  Database: {settings.DATABASE_NAME}")
        print("="*60)
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error connecting to MongoDB: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure MongoDB is running")
        print("2. Check MONGODB_URL in .env file")
        print("3. Verify connection string is correct")

if __name__ == "__main__":
    asyncio.run(check_database())

