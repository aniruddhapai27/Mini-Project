from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request, Depends
from models.response_model import voiceTranscript, InterviewResponse, FeedBackResponse
from controllers.interview_controller import transcript, text_to_speech_controller, ai_interview, get_interview_feedback
from models.request_models import TextToSpeechRequest, InterviewRequest, FeedbackRequest
from auth import require_auth

interview_router = APIRouter()

@interview_router.post("/transcript", response_model=voiceTranscript)
async def voice_to_text(file: UploadFile = File(...), current_user: dict = Depends(require_auth)):
    try:
        if not file.filename.endswith(('.mp3', '.wav', '.flac')):
            raise ValueError("Unsupported file type. Please upload an audio file.")
        transcript_text = await transcript(file)
        return voiceTranscript(text=transcript_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")


@interview_router.post("/text-to-speech")
async def text_to_speech(VoiceRequest: TextToSpeechRequest, current_user: dict = Depends(require_auth)):
    try:
        if not VoiceRequest.text:
            raise ValueError("Text cannot be empty.")
        if not VoiceRequest.voice:
            raise ValueError("Voice cannot be empty.")
        return await text_to_speech_controller(VoiceRequest.text, VoiceRequest.voice)
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")
    

@interview_router.post("/get-interview", response_model=InterviewResponse)
async def interview(InterviewRequest: InterviewRequest, current_user: dict = Depends(require_auth)):
    try:
        if not InterviewRequest.domain or not InterviewRequest.difficulty or not InterviewRequest.user:
            raise ValueError("Domain, difficulty, and user response are required fields.")
        
        # Use authenticated user ID
        user_id = current_user["_id"]
        
        response = await ai_interview(
            domain = InterviewRequest.domain,
            difficulty= InterviewRequest.difficulty,
            user_response = InterviewRequest.user,
            session = InterviewRequest.session or None,
            user_id = user_id
        )
        if not response:
            raise HTTPException(status_code=404, detail="No interview response generated.")
        return InterviewResponse(
            ai = response.get('ai', ''),
            session= response.get('session_id', ''),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing interview request: {str(e)}")


@interview_router.post("/feedback", response_model=FeedBackResponse)
async def feedback(feedbackRequest: FeedbackRequest, current_user: dict = Depends(require_auth)):
    try:
        if not feedbackRequest.session:
            raise ValueError("Session ID and feedback are required fields.")
        
        response = await get_interview_feedback(
            session_id = feedbackRequest.session
        )
        if not response:
            raise HTTPException(status_code=404, detail="No feedback response generated.")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing feedback request: {str(e)}")

@interview_router.post("/mock-interview", response_model=InterviewResponse)
async def mock_interview(InterviewRequest: InterviewRequest, current_user: dict = Depends(require_auth)):
    """
    Text-based mock interview endpoint for gamified interview experience
    """
    try:
        if not InterviewRequest.domain or not InterviewRequest.difficulty or not InterviewRequest.user:
            raise ValueError("Domain, difficulty, and user response are required fields.")
        
        # Use authenticated user ID
        user_id = current_user["_id"]
        
        response = await ai_interview(
            domain = InterviewRequest.domain,
            difficulty= InterviewRequest.difficulty,
            user_response = InterviewRequest.user,
            session = InterviewRequest.session or None,
            user_id = user_id
        )
        if not response:
            raise HTTPException(status_code=404, detail="No interview response generated.")
        return InterviewResponse(
            session_id=response["session_id"],
            ai=response["ai"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing mock interview: {str(e)}")

@interview_router.post("/mock-interview-feedback/{session_id}", response_model=FeedBackResponse)
async def mock_interview_feedback(session_id: str, current_user: dict = Depends(require_auth)):
    """
    Generate feedback for completed mock interview session
    """
    try:
        if not session_id:
            raise ValueError("Session ID is required.")
        
        feedback_data = await get_interview_feedback(session_id)
        if not feedback_data:
            raise HTTPException(status_code=404, detail="No feedback generated for this session.")
        
        return FeedBackResponse(
            feedback=feedback_data
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating interview feedback: {str(e)}")