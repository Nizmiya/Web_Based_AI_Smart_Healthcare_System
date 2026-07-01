"""Create or update 3 specialist doctors for disease-specific high-risk alerts."""
import bcrypt
from datetime import datetime
from pymongo import MongoClient

MONGODB_URL = "mongodb://localhost:27017/healthcare_db"
DATABASE_NAME = "healthcare_db"

SPECIALIST_DOCTORS = [
    {
        "email": "cardio@test.com",
        "password": "doctor123",
        "full_name": "Dr. Heart Specialist",
        "phone": "+91 9876543211",
        "specialization": "cardiologist",
    },
    {
        "email": "diabetesdoc@test.com",
        "password": "doctor123",
        "full_name": "Dr. Diabetes Specialist",
        "phone": "+91 9876543212",
        "specialization": "endocrinologist",
    },
    {
        "email": "kidneydoc@test.com",
        "password": "doctor123",
        "full_name": "Dr. Kidney Specialist",
        "phone": "+91 9876543213",
        "specialization": "nephrologist",
    },
]


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def main():
    client = MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    print("Seeding specialist doctors...\n")
    for doctor in SPECIALIST_DOCTORS:
        hashed = hash_password(doctor["password"])
        doc = {
            "email": doctor["email"],
            "full_name": doctor["full_name"],
            "phone": doctor["phone"],
            "role": "doctor",
            "specialization": doctor["specialization"],
            "password": hashed,
            "is_active": True,
            "updated_at": datetime.utcnow(),
        }
        result = db.users.update_one(
            {"email": doctor["email"]},
            {
                "$set": doc,
                "$setOnInsert": {"created_at": datetime.utcnow()},
            },
            upsert=True,
        )
        action = "Updated" if result.matched_count else "Created"
        print(f"[{action}] {doctor['email']} -> {doctor['specialization']}")

    # Remove specialization from old generic doctor so they stop receiving all alerts
    generic = db.users.update_one(
        {"email": "doctor@test.com", "role": "doctor"},
        {"$unset": {"specialization": ""}},
    )
    if generic.matched_count:
        print("\n[INFO] Removed specialization from doctor@test.com (no disease alerts).")

    print("\nLogin credentials (password: doctor123):")
    for doctor in SPECIALIST_DOCTORS:
        print(f"  - {doctor['email']} ({doctor['specialization']})")

    client.close()


if __name__ == "__main__":
    main()
