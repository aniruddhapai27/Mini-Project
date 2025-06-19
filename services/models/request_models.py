from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class TextToSpeechRequest(BaseModel):
    text: str = Field(..., description="The text to be converted to speech.")
    voice: Optional[str] = Field(default="Aaliyah-PlayAI", description="The voice to use for the speech synthesis.")
    

class InterviewRequest(BaseModel):
    domain: str = Field(..., description="The domain of the interview")
    difficulty: str = Field(..., description="The difficulty level of the interview")
    user: str = Field(..., description="The answer to the interview question")
    session: Optional[str] = Field(None, description="The session ID for the interview")

class FeedbackRequest(BaseModel):
    session: str = Field(..., description="The session ID for the interview")

class ChatRequest(BaseModel):
    user_query: str = Field(..., description="The user's query for the chat")
    subject: str = Field(default='ADA', description="The subject of the chat")
    session_id: Optional[str] = Field(None, description="The session ID for the chat")
    user_id: Optional[str] = Field(None, description="The user ID for the chat")

class ResumeAnalysisRequest(BaseModel):
    pass  # No fields needed since user_id comes from authentication
    