"""
Simple script to create healthcare_db database in MongoDB
Uses pymongo (synchronous) - easier to run
"""

from pymongo import MongoClient
from datetime import datetime
import os

# Get MongoDB URL from env or use default
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
DATABASE_NAME = 'healthcare_db'

print("="*60)
print("Creating MongoDB Database: healthcare_db")
print("="*60)

try:
    # Connect to MongoDB
    print(f"\nConnecting to: {MONGODB_URL}")
    client = MongoClient(MONGODB_URL)
    
    # Get or create database
    db = client[DATABASE_NAME]
    
    print(f"[OK] Connected to MongoDB!")
    print(f"[OK] Database '{DATABASE_NAME}' accessed")
    
    # Create collections by inserting a document (then delete it)
    collections = ['users', 'predictions', 'notifications', 'otps']
    
    print("\nCreating collections...")
    for collection_name in collections:
        # Insert and delete to create collection
        result = db[collection_name].insert_one({
            "_temp": True,
            "created_at": datetime.utcnow()
        })
        db[collection_name].delete_one({"_id": result.inserted_id})
        print(f"  [OK] Created collection: {collection_name}")
    
    # Create indexes
    print("\nCreating indexes...")
    
    # Users indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("role")
    print("  [OK] Indexes for 'users'")
    
    # Predictions indexes
    db.predictions.create_index("user_id")
    db.predictions.create_index("disease_type")
    db.predictions.create_index("created_at")
    print("  [OK] Indexes for 'predictions'")
    
    # Notifications indexes
    db.notifications.create_index("user_id")
    db.notifications.create_index("is_read")
    print("  [OK] Indexes for 'notifications'")
    
    # List collections
    existing_collections = db.list_collection_names()
    
    print("\n" + "="*60)
    print("Database Created Successfully!")
    print("="*60)
    print(f"\nDatabase: {DATABASE_NAME}")
    print(f"Collections ({len(existing_collections)}):")
    for col in existing_collections:
        count = db[col].count_documents({})
        print(f"  - {col:20s} ({count} documents)")
    
    print("\n[SUCCESS] Now refresh MongoDB Compass to see 'healthcare_db'!")
    print("="*60)
    
    client.close()
    
except Exception as e:
    print(f"\n[ERROR] Error: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Make sure MongoDB is running")
    print("2. Check connection string")
    print("3. Verify MongoDB Compass is connected to same MongoDB")

