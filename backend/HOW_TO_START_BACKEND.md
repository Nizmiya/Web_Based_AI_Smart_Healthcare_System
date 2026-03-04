# Backend Start Command Guide

## 🚀 Quick Start (Easiest Method)

### Windows (PowerShell):
```powershell
cd D:\DP\backend
.\start_backend.bat
```

### Windows (Command Prompt):
```cmd
cd backend
start_backend.bat
```



```bash
cd backend
python -m uvicorn app.main:app --reload --port 8080
```

### Linux/Mac:

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8080
```

---

## 📋 Step-by-Step Instructions

### Step 1: Navigate to Backend Folder
```bash
cd d:\DP\backend
```

### Step 2: Activate Virtual Environment (Optional but Recommended)
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Step 3: Start Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8080
```

---

## ✅ Prerequisites Check

Before starting, make sure:

1. **Python installed** (3.8+)
   ```bash
   python --version
   ```

2. **MongoDB running**
   - MongoDB should be running on `localhost:27017`
   - Check: Open MongoDB Compass or run `mongosh`

3. **Dependencies installed**
   ```bash
   pip install -r requirements.txt
   ```

---

## 📦 Database collections (healthcare_db)

| Collection         | Purpose |
|--------------------|--------|
| `users`            | Patients, doctors, admins |
| `predictions`      | Prediction results (includes `risk_level`, `risk_percentage`, `recommendation`, `doctor_recommendation`) |
| `patient_records`  | Patient-facing prediction records (same risk/recommendation data) |
| `notifications`    | In-app notifications (e.g. high-risk alerts) |
| `otps`             | One-time codes for forgot-password flow |
| `consultations`    | Doctor–patient appointments (includes `notes`, `doctor_private_notes` – private notes are doctor/admin only) |
| `doctor_leaves`    | Doctor leave dates (from_date, to_date, reason) |
| `audit_logs`       | Audit trail: who (user_id, role) viewed which patient profile/records and when |

**Note:** There are no separate tables for "risk" or "recommendations". Risk is stored on each prediction (`risk_level`, `risk_percentage`). Recommendations are generated per request using the Gemini API (patient + doctor recommendations) and can be stored on the prediction/patient_record documents.

To create all collections and indexes (including `consultations` and `patient_records`), run from the backend folder:
```bash
python simple_db_create.py
```

---

## 🌐 Backend URLs

After starting, backend will be available at:

- **API Base**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Health Check**: http://localhost:8080/health
- **Alternative Docs**: http://localhost:8080/redoc

---

## 📝 Expected Output

When backend starts successfully, you should see:

```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
Connected to MongoDB: healthcare_db
✅ MongoDB connection verified!
✅ Database 'healthcare_db' accessible. Collections: [...]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
```

---

## 🔧 Troubleshooting

### Error: Module not found
```bash
# Install dependencies
pip install -r requirements.txt
```

### Error: Port 8080 in use or WinError 10013 (access forbidden)
- Backend is set to **port 8080** (to avoid Windows port 8000 issues).
- If 8080 also fails: run PowerShell **as Administrator**, or try another port:
  ```bash
  python -m uvicorn app.main:app --reload --port 5000
  ```
  Then in **frontend** create `.env.local` with: `NEXT_PUBLIC_API_URL=http://localhost:5000`

### Error: MongoDB connection failed
1. Make sure MongoDB is running
2. Check MongoDB URL in `app/core/config.py`
3. Default: `mongodb://localhost:27017/healthcare_db`

### Error: Import errors
```bash
# Make sure you're in backend folder
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

### Heart Disease Prediction: 500 error or "state is not a legacy MT19937 state"
The heart model `.pkl` was saved with a different NumPy version. Retrain it in your current environment:

1. Ensure **heart.csv** is in `ml_training/` (same dataset used by the heart training notebook).
2. From project root (**D:\\DP**):
   ```powershell
   cd D:\DP
   python backend/scripts/retrain_heart_model.py
   ```
   Or from backend folder:
   ```powershell
   cd D:\DP\backend
   python scripts/retrain_heart_model.py
   ```
3. Restart the backend and try Heart Disease Prediction again.

---

## 🛑 Stop Backend

Press `Ctrl+C` in the terminal where backend is running

---

## 📌 Quick Reference

**Main Command:**
```bash
python -m uvicorn app.main:app --reload --port 8080
```

**With Virtual Environment:**
```bash
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8080
```

**Windows Batch File (PowerShell):**
```powershell
.\start_backend.bat
```

**Windows Batch File (CMD):**
```cmd
start_backend.bat
```

---

## ✅ Verification

After starting, test if backend is running:

1. Open browser: http://localhost:8080/health
2. Should return: `{"status":"healthy"}`
3. Or check: http://localhost:8080/docs for API documentation

---

## 📦 Required Packages

If you get import errors, install:
```bash
pip install fastapi uvicorn pymongo motor python-jose passlib scikit-learn pandas numpy joblib
```

Or install all from requirements.txt:
```bash
pip install -r requirements.txt
```

