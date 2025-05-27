import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview_routes import interview_router
from routes.assistant_routes import assistant_router

api = FastAPI(
    root_path="/services",
    # Explicitly set docs URL paths
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
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
    return {"message": "Hello World"}

api.include_router(interview_router, prefix = "/api/v1/interview", tags=["interview"])

api.include_router(assistant_router, prefix = "/api/v1/assistant", tags=["assistant"])
