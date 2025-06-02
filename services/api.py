import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from routes.interview_routes import interview_router
from routes.assistant_routes import assistant_router
from auth import COOKIE_NAME

api = FastAPI(
    root_path="/services",
    title="Mini Project FastAPI Services",
    description="FastAPI services for interview and assistant management with Node.js authentication integration",
    version="1.0.0",
    # Explicitly set docs URL paths
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

def custom_openapi():
    """
    Custom OpenAPI schema with JWT Cookie Authentication support.
    Compatible with Node.js Express backend authentication.
    """
    if api.openapi_schema:
        return api.openapi_schema

    openapi_schema = get_openapi(
        title="Mini Project FastAPI Services",
        version="1.0.0",
        description="FastAPI services with JWT Cookie Authentication compatible with Node.js Express backend",
        routes=api.routes,
    )    # Add cookie authentication security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "cookieAuth": {
            "type": "apiKey",
            "in": "cookie",
            "name": COOKIE_NAME,
            "description": "JWT token stored in httpOnly cookie (set by Node.js backend)"
        }
    }# Apply security to all protected endpoints
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            # Skip the root endpoint and other public endpoints
            if path not in ["/", "/docs", "/redoc", "/openapi.json"]:
                openapi_schema["paths"][path][method]["security"] = [{"cookieAuth": []}]

    api.openapi_schema = openapi_schema
    return api.openapi_schema

api.openapi = custom_openapi

# Allow CORS for all origins    
api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://my-project.tech"],
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
            "docs": "/docs"
        }
    }

api.include_router(interview_router, prefix = "/api/v1/interview", tags=["interview"])
api.include_router(assistant_router, prefix = "/api/v1/assistant", tags=["assistant"])
