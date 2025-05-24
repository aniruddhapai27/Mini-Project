from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview_routes import interview_router

api = FastAPI(root_path ="/services")

# Allow CORS for all origins    
api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://my-project.tech",
    ],  # Adjust this to restrict origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/")   
def root():
    return {"message": "Hello World"}

api.include_router(interview_router, prefix = "/api/v1/interview", tags=["interview"])

