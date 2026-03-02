# Backend Start Guide

## Quick Start

### Method 1: Using Batch File (Easiest - Windows)

```bash
cd backend
start_backend.bat
```

### Method 2: Manual Start (Windows/Linux/Mac)

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Method 3: Using Virtual Environment (Recommended)

```bash
cd backend

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

## Prerequisites

1. **Python 3.8+** installed
2. **MongoDB** running (localhost:27017)
3. **Dependencies** installed

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Backend URL

- **API URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Important Notes

1. **MongoDB must be running** before starting backend
2. Backend will automatically connect to MongoDB on startup
3. Check console for connection status
4. If MongoDB connection fails, backend will still start but database operations will fail

## Troubleshooting

### MongoDB Connection Error

- Make sure MongoDB is installed and running
- Check MongoDB URL in `.env` file or `config.py`
- Default: `mongodb://localhost:27017/healthcare_db`

### Port Already in Use

- Change port: `--port 8001`
- Or stop the process using port 8000

### Module Not Found

- Install dependencies: `pip install -r requirements.txt`
- Activate virtual environment if using one

## Environment Variables (Optional)

Create `.env` file in backend folder:

```
MONGODB_URL=mongodb://localhost:27017/healthcare_db
DATABASE_NAME=healthcare_db
SECRET_KEY=your-secret-key-here
DEBUG=True
```














