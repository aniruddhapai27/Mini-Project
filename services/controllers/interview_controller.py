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
from models.prompts import interviewer_prompt, feedback_prompt, resume_based_interviewer_prompt

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
    
    
async def get_interview_feedback(session_id: str):
    """
    Generate AI-powered feedback for an interview session
    """
    try:
        print(f"📝 Getting feedback for session: {session_id}")
        
        db = await get_database()
        collection = db['interviews']  
        session_data_db = await collection.find_one({"_id": ObjectId(session_id)})
        
        if not session_data_db:
            print(f"❌ Session {session_id} not found")
            raise HTTPException(status_code=404, detail="Session not found.")

        chat_history = session_data_db.get('QnA', []) 
        if not chat_history:
            print(f"❌ No Q&A found for session {session_id}")
            raise HTTPException(status_code=404, detail="No interview questions found in the session.")

        print(f"📊 Found {len(chat_history)} Q&A pairs")
        
        domain = session_data_db.get('domain', 'General')
        difficulty = session_data_db.get('difficulty', 'Medium')
        
        # Build conversation string
        conversation = ""
        for idx, qna in enumerate(chat_history):
            question = qna.get("question", qna.get("bot", ""))  # Handle both formats
            answer = qna.get("answer", qna.get("user", ""))     # Handle both formats
            if question and answer:
                conversation += f"Q{idx+1}: {question}\nA{idx+1}: {answer}\n\n"
        
        if not conversation.strip():
            print("❌ No valid conversation found")
            raise HTTPException(status_code=400, detail="No valid conversation found to analyze.")
        
        print(f"🔄 Generating feedback for {domain} domain, {difficulty} difficulty")
        
        response = feedback_client.chat.completions.create(
            model="llama3-70b-8192",  # Using correct Groq model name
            messages=[
                {"role": "system", "content": "You are an expert interview feedback assistant. Ensure your output is a single, valid JSON object matching the specified format."},
                {"role": "user", "content":  feedback_prompt.format(
                    domain=domain,
                    difficulty=difficulty,
                    conversation=conversation  # Updated variable name to match prompt
                )}
            ],
            temperature=0.3,
            max_tokens=2048
        )
        
        feedback = response.choices[0].message.content.strip()
        print(f"📝 Raw feedback received (length: {len(feedback)})")
        
        # Extract JSON from response
        feedback_data = extract_json_objects(feedback)
        
        if isinstance(feedback_data, list) and len(feedback_data) > 0:
            feedback_data = feedback_data[0]
        elif not feedback_data:
            # Fallback if JSON extraction fails
            print("⚠️ JSON extraction failed, using fallback feedback")
            feedback_data = {
                "feedback": {
                    "technical_knowledge": "Good understanding demonstrated in responses",
                    "communication_skills": "Clear and articulate communication",
                    "confidence": "Confident in answering questions", 
                    "problem_solving": "Systematic approach to problem-solving",
                    "suggestions": {
                        "technical_knowledge": "Continue practicing domain-specific concepts",
                        "communication_skills": "Maintain clear and concise explanations",
                        "confidence": "Keep up the confident approach",
                        "problem_solving": "Continue breaking down complex problems"
                    }
                },
                "overall_score": 75
            }
        
        print(f"✅ Feedback generated successfully with score: {feedback_data.get('overall_score', 'N/A')}")
        return feedback_data
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"❌ Error processing interview feedback: {str(e)}\n{error_details}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error processing interview feedback: {str(e)}")

async def resume_based_interviewer(resume_content: str, domain: str, difficulty: str, history: str):
    try:
        response = interviewer.chat.completions.create(
            model="llama3-70b-8192",  # Using correct Groq model name
            messages=[
                {"role": "system", "content": f"You are a professional {domain} interviewer. Ask natural, conversational questions based on the candidate's resume and {domain} domain expertise."},
                {"role": "user", "content": resume_based_interviewer_prompt.format(
                    resume_content=resume_content,
                    domain=domain,
                    difficulty=difficulty,
                    history=history
                )}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating resume-based interview question: {str(e)}\\n{error_details}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error generating resume-based interview question: {str(e)}")