from fastapi import APIRouter, HTTPException
from controllers.assistant_controller import get_daily_questions


assistant_router = APIRouter()

@assistant_router.post("/daily-questions")
async def daily_questions():
    try:
        message = await get_daily_questions()
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")

