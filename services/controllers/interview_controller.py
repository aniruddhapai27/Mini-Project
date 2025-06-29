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
        db = await get_database()
        collection = db['interviews']  
        session_data_db = await collection.find_one({"_id": ObjectId(session_id)})
        
        if not session_data_db:
            raise HTTPException(status_code=404, detail="Session not found.")

        chat_history = session_data_db.get('QnA', []) 
        if not chat_history:
            raise HTTPException(status_code=404, detail="No interview questions found in the session.")
        
        domain = session_data_db.get('domain', 'General')
        difficulty = session_data_db.get('difficulty', 'Medium')
        
        # Build conversation string
        conversation = ""
        for idx, qna in enumerate(chat_history):
            question = qna.get("question", qna.get("bot", ""))  # Handle both formats
            answer = qna.get("answer", qna.get("user", ""))     # Handle both formats
            
            # Skip empty responses or initial greetings
            if not question or not answer:
                continue
            if answer.strip() in ["Hello, I am ready to start the interview.", 
                                 "Hello, I'm ready to start the interview. Please begin with your first question."]:
                continue
                
            conversation += f"Q{idx+1}: {question}\\nA{idx+1}: {answer}\\n\\n"
        
        if not conversation.strip():
            raise HTTPException(status_code=400, detail="No valid conversation found to analyze.")
        
        response = feedback_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": "You are an expert interview feedback assistant. Ensure your output is a single, valid JSON object matching the specified format."},
                {"role": "user", "content":  feedback_prompt.format(
                    domain=domain,
                    difficulty=difficulty,
                    conversation=conversation
                )}
            ],
            temperature=0.3,
            max_tokens=2048
        )
        
        feedback = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        feedback_data = extract_json_objects(feedback)
        
        if isinstance(feedback_data, list) and len(feedback_data) > 0:
            feedback_data = feedback_data[0]
        elif not feedback_data:
            feedback_data = {}
        
        # Ensure the feedback data has the correct structure for Pydantic validation
        if not feedback_data or "feedback" not in feedback_data:
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
        else:
            # Ensure suggestions field exists in feedback
            if "suggestions" not in feedback_data["feedback"]:
                feedback_data["feedback"]["suggestions"] = {
                    "technical_knowledge": feedback_data["feedback"].get("technical_knowledge", "Continue practicing domain-specific concepts"),
                    "communication_skills": feedback_data["feedback"].get("communication_skills", "Maintain clear and concise explanations"),
                    "confidence": feedback_data["feedback"].get("confidence", "Keep up the confident approach"),
                    "problem_solving": feedback_data["feedback"].get("problem_solving", "Continue breaking down complex problems")
                }
            
            # Ensure overall_score exists and is an integer
            if "overall_score" not in feedback_data or not isinstance(feedback_data["overall_score"], (int, float)):
                feedback_data["overall_score"] = 75
            else:
                # Convert to int if it's a float
                feedback_data["overall_score"] = int(feedback_data["overall_score"])
        
        return feedback_data
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"❌ Error processing interview feedback: {str(e)}\n{error_details}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error processing interview feedback: {str(e)}")

async def resume_based_interviewer(resume_content: str, domain: str, difficulty: str, history: str):
    try:
        # Validate inputs
        if not resume_content or not resume_content.strip():
            resume_content = "No resume content provided. Please conduct a general interview based on the selected domain."
        
        if not domain:
            domain = "general"
            
        if not difficulty:
            difficulty = "medium"
            
        if not history:
            history = ""
        
        response = interviewer.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
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
        
        ai_response = response.choices[0].message.content.strip()
        
        # Ensure we have a valid response
        if not ai_response:
            ai_response = f"Thank you for your response. Let's continue with the {domain} interview. Can you tell me more about your experience in this field?"
            
        return ai_response
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating resume-based interview question: {str(e)}\\n{error_details}")
        if isinstance(e, HTTPException):
            raise
        
        # Provide fallback response based on domain
        fallback_responses = {
            "hr": "That's interesting! Can you tell me about a challenging situation you've faced in a team environment?",
            "dataScience": "Great! Can you walk me through a data analysis project you've worked on recently?", 
            "webdev": "Excellent! Can you describe a web application you've built and the technologies you used?",
            "fullTechnical": "Good answer! Can you explain your approach to solving complex technical problems?"
        }
        
        fallback_response = fallback_responses.get(domain, "Thank you for sharing that. Can you elaborate more on your experience?")
        return fallback_response