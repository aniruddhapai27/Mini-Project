from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from models.response_model import voiceTranscript
from controllers.interview_controller import transcript, text_to_speech_controller
from models.request_models import TextToSpeechRequest


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