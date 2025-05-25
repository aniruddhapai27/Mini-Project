from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
import os
from models.response_model import voiceTranscript
from models.request_models import TextToSpeechRequest
from controllers.interview_controller import transcript, text2speech

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
async def text_to_speech(request: TextToSpeechRequest):
    try:
        if not request.text:
            raise ValueError("Text cannot be empty.")
        if not request.voice:
            request.voice = "Mitch-PlayAI"  # Default voice
        speech_file_path = await text2speech(request.text, request.voice)
        return FileResponse(
            path=speech_file_path,
            media_type="audio/wav",
            filename=f"speech_{os.path.basename(speech_file_path)}",
            background=BackgroundTask(lambda: os.remove(speech_file_path) if os.path.exists(speech_file_path) else None)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text to speech: {str(e)}")