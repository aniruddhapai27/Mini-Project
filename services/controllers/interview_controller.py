from dotenv import load_dotenv
import os
from groq import Groq
from pathlib import Path
from fastapi import HTTPException, UploadFile
import traceback
from database.db_config import get_database
import datetime
from bson import ObjectId
from utils.helper import extract_json_objects
from models.prompts import interviewer_prompt, feedback_prompt

load_dotenv()

groq_api_audio = os.getenv("GROQ_API_AUDIO")
groq_api_key_interviewer = os.getenv("GROQ_API_KEY_DQ")
groq_api_key_feedback = os.getenv("GROQ_API_KEY_DQ")

interviewer = Groq(api_key = groq_api_key_interviewer)
client = Groq(api_key=groq_api_audio)
feedback_client = Groq(api_key=groq_api_key_feedback) 

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
        
        error_details = traceback.format_exc()
        print(f"Error generating speech: {str(e)}\n{error_details}") 
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")
    
    
async def ai_interview(domain, difficulty, user_response, session, user_id=None):
    try:
        db = await get_database()
        collection = db['interviews']  
        if not session:
            new_session = {
                "domain": domain,
                "difficulty": difficulty,
                "user": ObjectId(user_id) if user_id else None,  
                "created_at": str(datetime.datetime.now()),
                "QnA": [ 
                    {
                        "bot": "Welcome to the AI interview. Please introduce yourself.",
                        "user": user_response, 
                        "createdAt": str(datetime.datetime.now())  
                    }
                ]
            }
            result = await collection.insert_one(new_session)
            session = result.inserted_id
        else:

            try:
                if isinstance(session, str):
                    session = ObjectId(session)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid session ID format: {str(e)}")
                
        session_data = await collection.find_one({"_id":session})
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found.")
        history = session_data.get('QnA', [])  
        response = interviewer.chat.completions.create(
            model = "meta-llama/llama-4-scout-17b-16e-instruct",
            messages = [
                {
                    "role": "system",
                    "content": interviewer_prompt.format(domain=domain, difficulty=difficulty, history=history[-5:]) 
                },
                {
                    "role": "user",
                    "content": user_response
                }
            ]
        )
        question = response.choices[0].message.content.strip()
        await collection.update_one({"_id": session}, {"$push": {"QnA": {  
            "bot": question, 
            "user": user_response,
            "createdAt": str(datetime.datetime.now())  
        }}})
        return {
            "session_id": str(session),
            "ai": question
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error processing AI interview: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing AI interview: {str(e)}")  
    

async def get_interview_feedback(session_id: str):
    try:
        db = await get_database()
        collection = db['interviews']  
        session_data_db = await collection.find_one({"_id": ObjectId(session_id)})
        if not session_data_db:
            raise HTTPException(status_code=404, detail="Session not found.")

        chat_history = session_data_db.get('QnA', []) 
        if not chat_history:
            raise HTTPException(status_code=404, detail="No interview questions found in the session.")

        domain = session_data_db.get('domain', 'General')
        difficulty = session_data_db.get('difficulty', 'General')
        conversation = ""
        for idx, qna in enumerate(chat_history):
            question = qna.get("bot", "")  
            answer = qna.get("user", "")  
            conversation += f"Q{idx+1}: {question}\\nA{idx+1}: {answer}\\n"
        
        response = feedback_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": "You are an expert interview feedback assistant. Ensure your output is a single, valid JSON object matching the specified format."},
                {"role": "user", "content":  feedback_prompt.format(
                    domain=domain,
                    difficulty=difficulty,
                    conversation=conversation
                )}
            ]
        )
        feedback = response.choices[0].message.content.strip()
        feedback_data = extract_json_objects(feedback)
        if isinstance(feedback_data, list) and len(feedback_data) > 0:
            feedback_data = feedback_data[0]
        return feedback_data
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error processing interview feedback: {str(e)}\\n{error_details}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error processing interview feedback: {str(e)}")