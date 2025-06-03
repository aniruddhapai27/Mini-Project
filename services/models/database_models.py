from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class QnA(BaseModel):
    user: str = Field(..., description="User's message or answer")
    bot: str = Field(..., description="Bot's response or question")
    created_at: datetime = Field(default_factory=datetime.now)

class InterviewQnA(BaseModel):
    question: str = Field(..., description="Interview question")
    answer: str = Field(..., description="User's answer")
    created_at: datetime = Field(default_factory=datetime.now)

class ScoreEntry(BaseModel):
    dq: PyObjectId = Field(..., description="Reference to Daily Question")
    score: int = Field(..., description="Score achieved")
    date: datetime = Field(default_factory=datetime.now)

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="Hashed password")
    profile_pic: Optional[str] = Field(None, description="Profile picture URL")
    resume: Optional[str] = Field(None, description="Resume file path")
    current_streak: int = Field(default=0, description="Current daily streak")
    max_streak: int = Field(default=0, description="Maximum streak achieved")
    last_activity: Optional[datetime] = Field(None, description="Last activity date")
    scores: List[ScoreEntry] = Field(default=[], description="User's quiz scores")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class QuestionOption(BaseModel):
    question_num: int = Field(..., description="Question number")
    question: str = Field(..., description="Question text")
    options: List[str] = Field(..., description="Multiple choice options")
    answer: str = Field(..., description="Correct answer")

class DailyQuestion(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    questions: List[QuestionOption] = Field(..., description="List of questions")
    subject: str = Field(..., description="Subject area")
    date: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Interview(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user: Optional[PyObjectId] = Field(None, description="Reference to User")
    domain: str = Field(..., description="Interview domain/field")
    difficulty: str = Field(..., description="Difficulty level: easy, medium, hard")
    qna: List[InterviewQnA] = Field(default=[], description="Question and Answer pairs", alias="QnA")
    feedback: str = Field(default="", description="Interview feedback")
    score: int = Field(default=0, description="Interview score")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Assistant(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user: PyObjectId = Field(..., description="Reference to User")
    subject: str = Field(..., description="Subject area")
    qna: List[QnA] = Field(default=[], description="Chat history", alias="QnA")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Resume(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user: Optional[PyObjectId] = Field(None, description="Reference to User")  
    grammatical_mistakes: str = Field(default="", description="Grammatical issues found", alias="grammaticalMistakes")
    suggestions: str = Field(default="", description="Improvement suggestions")
    ats: int = Field(default=0, description="ATS score", alias="ATS")
    created_at: datetime = Field(default_factory=datetime.now, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.now, alias="updatedAt")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


COLLECTION_MAPPINGS = {
    "users": "users",  
    "dqs": "dqs",      # matches DQ model  
    "interviews": "interviews",  # matches Interview model
    "assistants": "assistants",  # matches Assistant model
    "resumes": "resumes"  # matches Resume model
}
