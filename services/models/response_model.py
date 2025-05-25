from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class voiceTranscript(BaseModel):
    text: str = Field(..., description="The transcribed text from the audio file.")
