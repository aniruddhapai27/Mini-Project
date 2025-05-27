from dotenv import load_dotenv
import os
from groq import Groq
from pathlib import Path
from fastapi import HTTPException, UploadFile
load_dotenv()

groq_api_audio = os.getenv("GROQ_API_AUDIO")
client = Groq(api_key=groq_api_audio)

async def transcript(file: UploadFile):
    try:
        import uuid
        temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
        
        content = await file.read()
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

async def text_to_speech_controller(text: str, voice: str = "Aaliyah-PlayAI"):
    try:
        import uuid
        from pathlib import Path
        import os
        from fastapi.responses import FileResponse
        from starlette.background import BackgroundTask

        unique_id = str(uuid.uuid4())
        output_dir = Path("speech_output")
        output_dir.mkdir(exist_ok=True) 
        
        speech_file_path = output_dir / f"{unique_id}.wav"
    
        response = client.audio.speech.create(
            model="playai-tts",  
            voice=voice,        
            response_format="wav", 
            input=text         
        )
        try:
            with open(speech_file_path, "wb") as f:
                response.write_to_file(speech_file_path)

        except AttributeError:
            try:
                response.stream_to_file(speech_file_path)
            except AttributeError as e:
                raise AttributeError(f"Groq response object does not have expected methods ('write_to_file' or 'stream_to_file'). Error: {e}")

        def cleanup_file(path):
            try:
                os.remove(path)
            except Exception:
                pass

        return FileResponse(
            path=speech_file_path,
            media_type="audio/wav",
            filename=f"speech_{unique_id}.wav",
            background=BackgroundTask(cleanup_file, speech_file_path)
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error generating speech: {str(e)}\n{error_details}") 
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")
    
    
    
    