from fastapi import APIRouter, HTTPException
from controllers.assistant_controller import get_daily_questions, chat_with_ai
from models.response_model import ChatResponse
from models.request_models import ChatRequest

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
        response = await chat_with_ai(
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
