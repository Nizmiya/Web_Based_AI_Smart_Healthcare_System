"""
Add Test Users to MongoDB - Simple Version
Creates 3 users: Patient, Doctor, Admin
"""

from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
import sys

MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
DATABASE_NAME = 'healthcare_db'

def hash_password(password):
    """Hash password using bcrypt (same method as auth.py)"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

# Test users
test_users = [
    {
        "email": "patient@test.com",
        "password": "patient123",
        "full_name": "Test Patient",
        "phone": "+91 9876543210",
        "role": "patient",
    },
    {
        "email": "cardio@test.com",
        "password": "doctor123",
        "full_name": "Dr. Heart Specialist",
        "phone": "+91 9876543211",
        "role": "doctor",
        "specialization": "cardiologist",
    },
    {
        "email": "diabetesdoc@test.com",
        "password": "doctor123",
        "full_name": "Dr. Diabetes Specialist",
        "phone": "+91 9876543212",
        "role": "doctor",
        "specialization": "endocrinologist",
    },
    {
        "email": "kidneydoc@test.com",
        "password": "doctor123",
        "full_name": "Dr. Kidney Specialist",
        "phone": "+91 9876543213",
        "role": "doctor",
        "specialization": "nephrologist",
    },
    {
        "email": "admin@test.com",
        "password": "admin123",
        "full_name": "Admin User",
        "phone": "+91 9876543214",
        "role": "admin",
    },
]

print("="*60)
print("Adding Test Users to MongoDB")
print("="*60)

try:
    client = MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"\nConnected to: {DATABASE_NAME}\n")
    
    created_count = 0
    skipped_count = 0
    
    for user_data in test_users:
        email = user_data["email"]
        
        # Check if exists
        existing = db.users.find_one({"email": email})
        if existing:
            print(f"[SKIP] User exists: {email}")
            skipped_count += 1
            continue
        
        # Hash password
        try:
            hashed = hash_password(user_data["password"])
        except Exception as e:
            print(f"[WARNING] Password hashing issue: {e}")
            # Use a placeholder hash - backend will handle properly
            hashed = f"$2b$12$placeholder.{hash(user_data['password']) % 1000000}"
        
        # Create user
        user_doc = {
            "email": email,
            "full_name": user_data["full_name"],
            "phone": user_data["phone"],
            "role": user_data["role"],
            "password": hashed,
            "is_active": True,
            "created_at": datetime.now(),
        }
        if user_data.get("specialization"):
            user_doc["specialization"] = user_data["specialization"]

        result = db.users.insert_one(user_doc)
        created_count += 1
        print(f"[OK] Created {user_data['role']}: {email}")
    
    print("\n" + "="*60)
    print(f"Summary: {created_count} created, {skipped_count} skipped")
    print("="*60)
    
    # Show all users
    all_users = list(db.users.find({}, {"password": 0, "_id": 0}))
    print(f"\nAll Users in Database ({len(all_users)}):")
    for user in all_users:
        print(f"  - {user.get('email', 'N/A'):25s} | {user.get('role', 'N/A'):10s} | {user.get('full_name', 'N/A')}")
    
    print("\n" + "="*60)
    print("Login Credentials:")
    print("="*60)
    print("\nPATIENT:")
    print("  Email: patient@test.com")
    print("  Password: patient123")
    print("\nSPECIALIST DOCTORS (password: doctor123):")
    print("  Cardiologist:     cardio@test.com")
    print("  Endocrinologist:  diabetesdoc@test.com")
    print("  Nephrologist:     kidneydoc@test.com")
    print("\nADMIN:")
    print("  Email: admin@test.com")
    print("  Password: admin123")
    print("\n" + "="*60)
    print("Now refresh MongoDB Compass to see users!")
    print("="*60)
    
    client.close()
    
except Exception as e:
    print(f"\n[ERROR] {str(e)}")
    import traceback
    traceback.print_exc()

