from fastapi import APIRouter, UploadFile, File
from controllers.interview_controller import get_emotions

interview_router = APIRouter()

@interview_router.post("/emotion")
async def get_emotion(uploaded_file: UploadFile = File(...)):
    try:
        image = await uploaded_file.read()
        result = get_emotions(image)
        return result
    except Exception as e:
        return {"error": str(e), "message": "An error occurred while processing the image."}