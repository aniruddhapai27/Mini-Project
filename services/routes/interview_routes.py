from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request, Depends
from models.response_model import voiceTranscript, InterviewResponse, FeedBackResponse
from controllers.interview_controller import transcript, text_to_speech_controller, get_interview_feedback, resume_based_interviewer
from models.request_models import TextToSpeechRequest, FeedbackRequest
from utils.auth_middleware import require_auth_dep
from database.db_config import get_database
from bson import ObjectId
import datetime

interview_router = APIRouter()

@interview_router.post("/transcript", response_model=voiceTranscript)
async def voice_to_text(file: UploadFile = File(...), current_user: dict = Depends(require_auth_dep)):
    try:
        if not file.filename.endswith(('.mp3', '.wav', '.flac')):
            raise ValueError("Unsupported file type. Please upload an audio file.")
        transcript_text = await transcript(file)
        return voiceTranscript(text=transcript_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")

@interview_router.post("/text-to-speech")
async def text_to_speech(VoiceRequest: TextToSpeechRequest, current_user: dict = Depends(require_auth_dep)):
    try:
        if not VoiceRequest.text:
            raise ValueError("Text cannot be empty.")
        if not VoiceRequest.voice:
            raise ValueError("Voice cannot be empty.")
        return await text_to_speech_controller(VoiceRequest.text, VoiceRequest.voice)
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@interview_router.post("/feedback", response_model=FeedBackResponse)
async def feedback(feedbackRequest: FeedbackRequest, current_user: dict = Depends(require_auth_dep)):
    try:
        if not feedbackRequest.session:
            raise ValueError("Session ID is required.")
        
        response = await get_interview_feedback(
            session_id = feedbackRequest.session
        )
        if not response:
            raise HTTPException(status_code=404, detail="No feedback response generated.")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing feedback request: {str(e)}")

@interview_router.post("/resume-based", response_model=InterviewResponse)
async def resume_based_interview(
    file: UploadFile = File(...),
    domain: str = Form(...),
    difficulty: str = Form(...),
    user_response: str = Form(...),
    session: str = Form(None),
    current_user: dict = Depends(require_auth_dep)
):
    """
    Resume-based interview endpoint that generates questions based on the candidate's resume and specified domain
    """
    try:
        # Validate inputs
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF, DOCX, or TXT file.")
        
        if domain not in ['hr', 'dataScience', 'webdev', 'fullTechnical']:
            raise HTTPException(status_code=400, detail="Domain must be 'hr', 'dataScience', 'webdev', or 'fullTechnical'.")
        
        if difficulty not in ['easy', 'medium', 'hard']:
            raise HTTPException(status_code=400, detail="Difficulty must be 'easy', 'medium', or 'hard'.")
        
        if not user_response.strip():
            raise HTTPException(status_code=400, detail="User response cannot be empty.")
        
        # Use authenticated user ID
        user_id = current_user["_id"]
        
        # Parse resume content
        from utils.helper import extract_text
        resume_content = extract_text(file)
        if not resume_content:
            raise HTTPException(status_code=400, detail="Could not extract text from the resume file.")
        
        # Get or create session
        db = await get_database()
        collection = db['interviews']
        
        if session:
            # Get existing session
            session_doc = await collection.find_one({"_id": ObjectId(session), "user_id": user_id})
            if not session_doc:
                raise HTTPException(status_code=404, detail="Interview session not found.")
            
            # Build conversation history
            history = ""
            if "conversation" in session_doc:
                for item in session_doc["conversation"]:
                    history += f"Interviewer: {item.get('interviewer', '')}\nCandidate: {item.get('candidate', '')}\n"
            
            # Add current user response to history
            history += f"Candidate: {user_response}\n"
        else:
            # Create new session
            session_doc = {
                "user_id": user_id,
                "domain": domain,
                "difficulty": difficulty,
                "resume_content": resume_content[:1000],  # Store first 1000 chars for reference
                "conversation": [],
                "created_at": datetime.datetime.now(),
                "type": "resume_based"
            }
            result = await collection.insert_one(session_doc)
            session = str(result.inserted_id)
            history = f"Candidate: {user_response}\n"
        
        # Generate next question
        ai_response = await resume_based_interviewer(resume_content, domain, difficulty, history)
        
        # Update session with new conversation
        await collection.update_one(
            {"_id": ObjectId(session)},
            {
                "$push": {
                    "conversation": {
                        "candidate": user_response,
                        "interviewer": ai_response,
                        "timestamp": datetime.datetime.now()
                    }
                }
            }
        )
        
        return InterviewResponse(
            session_id=session,
            ai=ai_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume-based interview: {str(e)}")
