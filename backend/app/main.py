from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.api.v1 import auth, predictions, users, notifications, patient_records, chatbot, consultations
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-Powered Smart Healthcare System API"
)


class CORSPreflightMiddleware(BaseHTTPMiddleware):
    """Handle OPTIONS preflight so it always returns 200 and avoids CORS 400."""
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS" and request.headers.get("access-control-request-method"):
            origin = request.headers.get("origin") or "*"
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                    "Access-Control-Max-Age": "600",
                    "Access-Control-Allow-Credentials": "true",
                },
            )
        return await call_next(request)


# Add preflight handler first (runs last = executes first for incoming requests)
app.add_middleware(CORSPreflightMiddleware)

# CORS Middleware - Must be added before routers
# Allow any localhost/127.0.0.1 port so frontend dev server always works
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3003",
]
if settings.BACKEND_CORS_ORIGINS:
    cors_origins.extend(settings.BACKEND_CORS_ORIGINS)

# Regex: allow any port on localhost or 127.0.0.1 (avoids OPTIONS 400 when frontend uses different port)
allow_origin_regex = r"http://(localhost|127\.0\.0\.1)(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on startup"""
    try:
        await connect_to_mongo()
        # Test connection
        from app.core.database import db
        if db.client:
            await db.client.admin.command('ping')
            print("MongoDB connection verified!")
            # Test database access
            test_db = db.client[settings.DATABASE_NAME]
            collections = await test_db.list_collection_names()
            print(f"Database '{settings.DATABASE_NAME}' accessible. Collections: {collections}")
        else:
            print("MongoDB connection failed!")
    except Exception as e:
        print(f"MongoDB startup error: {str(e)}")
        print("Please check if MongoDB is running and connection settings are correct.")
        print(f"MongoDB URL: {settings.MONGODB_URL}")
        print(f"Database Name: {settings.DATABASE_NAME}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(patient_records.router, prefix="/api/v1/patient-records", tags=["Patient Records"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(consultations.router, prefix="/api/v1/consultations", tags=["Consultations"])

# Admin router
from app.api.v1 import admin
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "AI-Powered Smart Healthcare System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

