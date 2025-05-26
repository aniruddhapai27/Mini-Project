from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
import os
import uuid
from pathlib import Path
from models.response_model import voiceTranscript
from controllers.interview_controller import transcript, text_to_speech_controller

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
async def text_to_speech(text: str, voice: str = Form("Aaliyah-PlayAI")):
    try:
        if not text:
            raise ValueError("Text cannot be empty.")
        if not voice:
            raise ValueError("Voice cannot be empty.")
        return await text_to_speech_controller(text, voice)
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")