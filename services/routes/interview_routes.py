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
    """
    Generate AI-powered feedback for an interview session
    """
    try:
        if not feedbackRequest.session:
            raise HTTPException(status_code=400, detail="Session ID is required.")
        
        # Validate session ID format
        try:
            ObjectId(feedbackRequest.session)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid session ID format.")
        
        # Get feedback from controller
        response = await get_interview_feedback(session_id=feedbackRequest.session)
        
        if not response:
            raise HTTPException(status_code=404, detail="No feedback response generated.")
        
        # Return the response in the expected format
        return FeedBackResponse(
            feedback=response.get("feedback", {}),
            overall_score=response.get("overall_score", 0)
        )
        
    except HTTPException:
        raise
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
        
        # Use authenticated user ID - convert back to ObjectId if it's a string
        user_id = current_user["_id"]
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Parse resume content
        from utils.helper import extract_text
        resume_content = extract_text(file)
        if not resume_content:
            raise HTTPException(status_code=400, detail="Could not extract text from the resume file.")
        
        # Get or create session
        db = await get_database()
        collection = db['interviews']
        
        if session:
            # Check if session is a valid ObjectId (not a fallback session)
            try:
                session_object_id = ObjectId(session)
                # Get existing session - Node.js sessions don't filter by user_id in the lookup
                session_doc = await collection.find_one({"_id": session_object_id})
                if not session_doc:
                    raise HTTPException(status_code=404, detail="Interview session not found.")
            except Exception as e:
                # Session is not a valid ObjectId (likely a fallback session)
                # Try to find by sessionId field instead
                session_doc = await collection.find_one({"sessionId": session})
                if not session_doc:
                    session_doc = None
            
            # Build conversation history from Node.js QnA structure
            history = ""
            if session_doc and "QnA" in session_doc:
                for idx, qna in enumerate(session_doc["QnA"]):
                    # Skip the first exchange which is the initial greeting
                    user_msg = qna.get('user', '').strip()
                    if (idx == 0 and (user_msg == "Hello, I am ready to start the interview." or 
                                     user_msg == "Hello, I'm ready to start the interview. Please begin with your first question.")):
                        continue
                    
                    interviewer_msg = qna.get('bot', '')
                    candidate_msg = qna.get('user', '')
                    if interviewer_msg and candidate_msg:
                        history += f"Interviewer: {interviewer_msg}\\n\\nCandidate: {candidate_msg}\\n\\n"
            
            # Add current user response only if it's not the initial greeting
            if (user_response.strip() != "Hello, I am ready to start the interview." and
                user_response.strip() != "Hello, I'm ready to start the interview. Please begin with your first question."):
                history += f"Candidate: {user_response}\\n"
        else:
            # For new interviews, only add the current response if it's not the initial greeting
            if (user_response.strip() != "Hello, I am ready to start the interview." and
                user_response.strip() != "Hello, I'm ready to start the interview. Please begin with your first question."):
                history = f"Candidate: {user_response}\\n"
            else:
                history = ""
        
        # Generate next question
        ai_response = await resume_based_interviewer(resume_content, domain, difficulty, history)
        
        return InterviewResponse(
            ai=ai_response,
            session_id=session
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in resume-based interview: {str(e)}")
        import traceback
        print(f"📊 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing resume-based interview: {str(e)}")
