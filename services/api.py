import os
import tensorflow as tf

# Suppress TensorFlow warnings
tf.get_logger().setLevel('ERROR')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # 0=all, 1=info, 2=warning, 3=error

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview_routes import interview_router

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
    allow_origins=["*"],  # More permissive for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/")   
def root():
    return {"message": "Hello World"}

api.include_router(interview_router, prefix = "/api/v1/interview", tags=["interview"])

