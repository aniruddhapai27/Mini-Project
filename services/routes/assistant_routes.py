from fastapi import APIRouter, HTTPException, UploadFile, File
from controllers.assistant_controller import get_daily_questions, study_assistant, analyse_resume
from models.response_model import ChatResponse
from models.request_models import ChatRequest
from utils.helper import extract_text 

assistant_router = APIRouter()

@assistant_router.post("/daily-questions")
async def daily_questions():
    try:
        message = await get_daily_questions()
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")

@assistant_router.post("/chat", response_model= ChatResponse)
async def chat(chatRequest: ChatRequest):
    try:
        if not chatRequest.user_query or not chatRequest.subject:
            raise HTTPException(status_code=400, detail="Query and subject are required fields.")
        response = await study_assistant(
            user_query=chatRequest.user_query,
            subject=chatRequest.subject,
            session_id=chatRequest.session_id
        )
        return ChatResponse(
            session_id=response.get('session_id', ''),
            response=response.get('ai', ''),
            subject=chatRequest.subject
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@assistant_router.post("/resume")
async def resume_chat(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a text-based document.")
        resume_content = await analyse_resume(file)
        return {"message": "Resume processed successfully", "content": resume_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume file: {str(e)}")
    
@assistant_router.post( "/parser")
def parse_resume(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a text-based document.")
        resume_content = extract_text(file)
        return {"message": "Resume parsed successfully", "content": resume_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume file: {str(e)}")