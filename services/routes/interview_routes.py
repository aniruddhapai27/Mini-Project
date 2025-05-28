from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from models.response_model import voiceTranscript, InterviewResponse, FeedBackResponse
from controllers.interview_controller import transcript, text_to_speech_controller, ai_interview, get_feedback
from models.request_models import TextToSpeechRequest, InterviewRequest, FeedbackRequest

interview_router = APIRouter()

@interview_router.post("/transcript", response_model=voiceTranscript)
async def voice_to_text(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.mp3', '.wav', '.flac')):
            raise ValueError("Unsupported file type. Please upload an audio file.")
        transcript_text = await transcript(file)
        return voiceTranscript(text=transcript_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")


@interview_router.post("/text-to-speech")
async def text_to_speech(VoiceRequest: TextToSpeechRequest):
    try:
        if not VoiceRequest.text:
            raise ValueError("Text cannot be empty.")
        if not VoiceRequest.voice:
            raise ValueError("Voice cannot be empty.")
        return await text_to_speech_controller(VoiceRequest.text, VoiceRequest.voice)
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")
    

@interview_router.post("/interview", response_model=InterviewResponse)
async def interview(InterviewRequest: InterviewRequest):
    try:
        if not InterviewRequest.domain or not InterviewRequest.difficulty or not InterviewRequest.user:
            raise ValueError("Domain, difficulty, and user response are required fields.")
        
        response = await ai_interview(
            domain = InterviewRequest.domain,
            difficulty= InterviewRequest.difficulty,
            user_response = InterviewRequest.user,
            session = InterviewRequest.session or None
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
async def feedback(feedbackRequest: FeedbackRequest):
    try:
        if not feedbackRequest.session or not feedbackRequest.user:
            raise ValueError("Session ID and feedback are required fields.")
        
        response = await get_feedback(
            session = feedbackRequest.session
        )
        if not response:
            raise HTTPException(status_code=404, detail="No feedback response generated.")
        return {
            "session": response.get('session_id', ''),
            "feedback": response.get('feedback', ''),
            "score": response.get('score', 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing feedback request: {str(e)}")