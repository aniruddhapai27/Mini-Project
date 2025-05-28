from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class TextToSpeechRequest(BaseModel):
    text: str = Field(..., description="The text to be converted to speech.")
    voice: Optional[str] = Field(default="Aaliyah-PlayAI", description="The voice to use for the speech synthesis.")
    

class InterviewRequest(BaseModel):
    domain: str = Field(..., description="The domain of the interview")
    difficulty: str = Field(..., description="The difficulty level of the interview")
    user: str = Field(..., description="The answer to the interview question")
    session: str = Field(Optional,description="The session ID for the interview")
    
    