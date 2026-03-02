"""Check MongoDB collections"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def check_collections():
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        collections = await db.list_collection_names()
        print(f"\n{'='*70}")
        print(f"MongoDB Database: {settings.DATABASE_NAME}")
        print(f"{'='*70}")
        print(f"\nTotal Collections: {len(collections)}")
        print(f"\nCollections List:")
        for i, col in enumerate(collections, 1):
            count = await db[col].count_documents({})
            print(f"  {i}. {col:20s} - {count:6,} documents")
        
        # Check if patient_records exists
        if 'patient_records' in collections:
            print(f"\n✅ patient_records collection exists!")
        else:
            print(f"\n⚠️  patient_records collection not found (will be created on first save)")
        
        print(f"\n{'='*70}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_collections())















