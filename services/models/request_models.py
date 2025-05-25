from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class TextToSpeechRequest(BaseModel):
    text: str = Field(..., description="The text to be converted to speech.")
    voice: Optional[str] = Field(default="Aaliyah-PlayAI", description="The voice to use for the speech synthesis.")
    