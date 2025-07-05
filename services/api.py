import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from routes.interview_routes import interview_router
from routes.assistant_routes import assistant_router
from auth import require_auth

# Security scheme for Swagger UI
security = HTTPBearer()

api = FastAPI(
    root_path="/services",
    title="Mini Project FastAPI Services",
    description="""
    FastAPI services for interview and assistant management with Node.js authentication integration.
    
    ## Authentication
    
    This API uses JWT Bearer tokens for authentication. To authenticate:
    
    1. **For Swagger UI**: Click the "Authorize" button and enter your JWT token
    2. **For API calls**: Include the token in the Authorization header: `Bearer YOUR_JWT_TOKEN`
    
    ## Getting a Token
    
    Obtain a JWT token by logging in through the Node.js authentication service.
    The token should be included in API requests as: `Authorization: Bearer <token>`
    """,
    version="1.0.0",
    # Explicitly set docs URL paths
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow CORS for all origins    
api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://my-project.tech", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/")   
def root():
    return {
        "message": "Mini Project FastAPI Services", 
        "status": "running",
        "authentication": "integrated with Node.js JWT",
        "endpoints": {
            "interview": "/api/v1/interview",
            "assistant": "/api/v1/assistant", 
            "docs": "/docs",
            "auth_test": "/auth-test"
        }
    }

@api.get("/auth-test")
async def test_authentication(current_user: dict = Depends(require_auth)):
    """
    Test endpoint to verify JWT authentication is working.
    Requires valid JWT token in Authorization header or cookies.
    """
    return {
        "message": "Authentication successful!",
        "user_id": current_user.get("_id"),
        "user_name": current_user.get("name"),
        "user_email": current_user.get("email")
    }

api.include_router(interview_router, prefix = "/api/v1/interview", tags=["interview"])
api.include_router(assistant_router, prefix = "/api/v1/assistant", tags=["assistant"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:api", host="0.0.0.0", port=8000, reload=True)
