from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class voiceTranscript(BaseModel):
    text: str = Field(..., description="The transcribed text from the audio file.")


class QuestionDetail(BaseModel):
    option1: str
    option2: str
    option3: str
    option4: str

class DailyQuestionItem(BaseModel):
    question: QuestionDetail
    correct_ans: str
    subject: str
    created: str 

class DailyQuestionsResponse(BaseModel):
    questions: List[DailyQuestionItem]

class InterviewResponse(BaseModel):
    ai: str
    session: Optional[str] = None
    
class FeedBackResponse(BaseModel):
    session: str
    feedback: str
    score: int
    overall_score: int
    
