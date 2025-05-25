from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import requests
from groq import Groq
from pathlib import Path
from fastapi import HTTPException, UploadFile
import pyttsx3
load_dotenv()

groq_api_audio = os.getenv("GROQ_API_AUDIO")
client = Groq(api_key=groq_api_audio)

async def transcript(file: UploadFile):
    try:
        # Create a unique temporary filename
        import uuid
        temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
        
        content = await file.read()
        
        # Write to a temporary file
        with open(temp_filename, "wb") as temp_file:
            temp_file.write(content)

  
        with open(temp_filename, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="verbose_json",
                language="en",
                temperature=1.0
            )
            
        os.remove(temp_filename)
        
        return transcription.text
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing audio file: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")
      
async def text2speech(text, voice):
    try:
        if not text:
            raise ValueError("Text cannot be empty.")
        
        import uuid
        # Create unique ID and output directory
        unique_id = str(uuid.uuid4())
        output_dir = Path(__file__).parent.parent / "speech_output"
        output_dir.mkdir(exist_ok=True)
        
        speech_file_path = output_dir / f"{unique_id}.wav"
        
        engine = pyttsx3.init()
        # Optionally set voice if available
        if voice:
            voices = engine.getProperty('voices')
            for v in voices:
                if voice.lower() in v.name.lower():
                    engine.setProperty('voice', v.id)
                    break
        engine.save_to_file(text, str(speech_file_path))
        engine.runAndWait()
        return str(speech_file_path)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error generating speech: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")