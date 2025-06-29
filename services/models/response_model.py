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
    session_id: Optional[str] = None
    
class FeedbackSuggestions(BaseModel):
    technical_knowledge: str
    communication_skills: str
    confidence: str
    problem_solving: str

class FeedbackDetail(BaseModel):
    technical_knowledge: str
    communication_skills: str
    confidence: str
    problem_solving: str
    suggestions: FeedbackSuggestions

class FeedBackResponse(BaseModel):
    feedback: FeedbackDetail
    overall_score: int

class ChatResponse(BaseModel):
    response: str
    subject: str
    session_id: str
