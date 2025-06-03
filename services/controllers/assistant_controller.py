from groq import Groq
from dotenv import load_dotenv
import os
import datetime
from fastapi import HTTPException
from bson import ObjectId
import traceback
from database.db_config import get_database
from utils.helper import extract_json_objects, extract_text
from models.prompts import daily_questions_prompt, resume_prompt, study_assistant_prompt

load_dotenv()
groq_api_key_dq = os.getenv("GROQ_API_KEY_DQ")
client = Groq(api_key = groq_api_key_dq)
study = Groq(api_key=groq_api_key_dq)

textbook = {
    "ADA":"The Design and Analysis of Algorithms, by Anany Levitan",
    "CN":"Computer Networking : A Top-Down Approach, by James Kurose and Keith Ross",
    "DBMS":"Database Management Systems, by Raghu Ramakrishnan and Johannes Gehrke",
    "OS":"Operating System Concepts, by Abraham Silberschatz, Peter B. Galvin, and Greg Gagne",
    "SE":"Software Enginnering, A Practitioner's Approach, by Roger S. Pressman and Bruce R. Maxim",
    "DS":"Data Structures and Algorithms in Java, by Robert Lafore", 
}

async def get_daily_questions():
    try:
        subjects = ["Data Structures", "operating systems", "computer networks", "database management systems", "software engineering", "algorithm design and analysis"]
        daily_questions = []
        db = await get_database()
        for subject in subjects:
            collection = db['dqs']
            existing_questions = await collection.find({'subject': subject}).to_list(length=30)
            existing_questions_list = [q['question'] for q in existing_questions]  
            response  = client.chat.completions.create(
                model = "meta-llama/llama-4-scout-17b-16e-instruct",
                messages = [
                    {
                        "role" : "system",
                        "content" : daily_questions_prompt.format(subject=subject, list=existing_questions_list)
                        
                    },
                ]
            )
            questions = extract_json_objects(response.choices[0].message.content)            
            for question in questions:
                question['subject'] = subject
                question['date'] = str(datetime.date.today())  # Changed to match Node.js field name
                daily_questions.append(question)
        if not daily_questions:
            raise HTTPException(status_code=404, detail="No daily questions generated.")    
        await collection.insert_many(daily_questions)
        return {"message": "Daily questions successfully stored  in the database."}
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error fetching daily questions: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")
 
    
async def study_assistant(user_query: str, subject: str, session_id: str = None, user_id: str = None):
    try:
        db = await get_database()
        collection = db['assistants'] 
        session = session_id
        if not session:
            new_session = {
                "subject": subject,
                "user": ObjectId(user_id) if user_id else None, 
                "created_at": str(datetime.datetime.now()),
                "QnA": [] 
            }
            result = await collection.insert_one(new_session)
            session = result.inserted_id
        else:
            try:
                if isinstance(session, str):
                    session = ObjectId(session)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid session ID format: {str(e)}")
        session_data = await collection.find_one({"_id": session})
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found.")
        history = session_data.get('QnA', []) 
        chat_history = [(q['user'], q['bot']) for q in history]  
        textbook_name = textbook.get(subject, "Unknown Subject")
        response = study.chat.completions.create(
            model = "meta-llama/llama-4-scout-17b-16e-instruct",
            messages = [
                {
                    "role": "system",
                    "content": study_assistant_prompt.format(
                        subject=subject, 
                        textbook=textbook_name, 
                        history=chat_history[-5:]
                    )
                },
                {
                    "role": "user",
                    "content": user_query
                },
            ]
        )
        response_text = response.choices[0].message.content.strip()        
        await collection.update_one(
            {"_id": session}, 
            {"$push": {"QnA": { 
                "user": user_query,  
                "bot": response_text,  
                "createdAt": str(datetime.datetime.now())  
            }}}
        )        
        return {
            "session_id": str(session),
            "response": response_text,  
            "subject": subject
        }
    except Exception as e:
        error_details = traceback.format_exc()  
        print(f"Error processing study assistant request: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing study assistant request: {str(e)}")
        
async def analyse_resume(file, user_id: str = None):
    try:
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a text-based document.")
        text = extract_text(file)
        if not text:
            raise HTTPException(status_code=400, detail="The file is empty or could not be read.")
        response = client.chat.completions.create(
            model = "meta-llama/llama-4-scout-17b-16e-instruct",
            messages = [
                {
                    "role": "system",
                    "content": resume_prompt.format(text=text)
                }
            ]
        )
        resume_analysis = extract_json_objects(response.choices[0].message.content)
        if not resume_analysis:
            raise HTTPException(status_code=400, detail="Failed to analyze the resume. Please check the content.")
        if len(resume_analysis) > 1:
            raise HTTPException(status_code=400, detail="Multiple JSON objects found in the response. Expected a single object.")
        
        
        analysis_data = resume_analysis[0]
        
        db = await get_database()
        collection = db['resumes'] 
        
        resume_document = {
            "fileName": file.filename,
            "grammaticalMistakes": analysis_data.get("grammatical_mistakes", ""),
            "suggestions": analysis_data.get("suggestions", ""),
            "ATS": analysis_data.get("ats_score", 0),
            "createdAt": datetime.datetime.now(),
            "updatedAt": datetime.datetime.now()
        }
        
    
        if user_id:
            try:
                resume_document["user"] = ObjectId(user_id)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid user ID format: {str(e)}")
        
        await collection.insert_one(resume_document)
        return resume_analysis
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error processing resume file: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing resume file: {str(e)}")
