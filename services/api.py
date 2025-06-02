import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview_routes import interview_router
from routes.assistant_routes import assistant_router

api = FastAPI(
    root_path="/services",
    title="Mini Project FastAPI Services",
    description="FastAPI services for interview and assistant management with Node.js authentication integration",
    version="1.0.0",
    # Explicitly set docs URL paths
    docs_url="/docs",
    redoc_url="/redoc",
)

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
