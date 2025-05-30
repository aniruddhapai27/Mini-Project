from groq import Groq
from dotenv import load_dotenv
import os
import datetime
from fastapi import HTTPException
from bson import ObjectId
import traceback
from database.db_config import get_database
from utils.helper import extract_json_objects

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

daily_questions_prompt = (
    'You are an expert in creating daily interview questions for engineering students. '
    'Generate 10 easy to medium questions for the subject: {subject}. '
    'Recent questions: {list}. '
    'Do not repeat any questions from the list. '
    'Format each question as JSON: '
    '{{'
    '  "question": "Your question text here",'
    '  "option1": "Option 1",'
    '  "option2": "Option 2",'
    '  "option3": "Option 3",'
    '  "option4": "Option 4",'
    '  "answer": "correct option",'
    '  "subject": "subject name"'
    '}}. '
    'Return only JSON, no extra text.'
)

study_assistant_prompt = (
    'You are a study assistant for {subject}, using "{textbook}" as your only reference. '
    'Dont answer like according to the textbook, instead, answer like you are a human expert in the subject. but dont answer questions from other than the texboks'
    'Answer only questions related to the textbook; otherwise, reply: "I cannot answer this question as it is not related to the textbook." '
    'Give clear, concise answers without asking for clarification or follow-ups. '
    'Dont answr irrelevant questions. you can use the textbook to answer questions. '
    'Use simple diagrams or code if needed. '
    'Chat History: {history}'
)

async def get_daily_questions():
    try:
        subjects = ["Data Structures"]
        daily_questions = []
        db = await get_database()
        for subject in subjects:
            collection = db['Daily_Questions']
            existing_questions = await collection.find({'subject': subject}).to_list(length=None)
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
                question['created'] = str(datetime.date.today())
                daily_questions.append(question)
        if not daily_questions:
            raise HTTPException(status_code=404, detail="No daily questions generated.")    
        await collection.insert_many(daily_questions)
        return {"message": "Daily questions successfully stored  in the database."}
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error fetching daily questions: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")
 
    
async def study_assistant(user_query: str, subject: str, session_id: str = None):
    try:
        db = await get_database()
        collection = db['Chat_Sessions']
        session = session_id
        if not session:
            new_session ={
                "subject" :subject,
                "created_at": str(datetime.datetime.now()),
                "Qna": []
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
        history = session_data.get('Qna', [])
        chat_history = [(q['user_query'], q['ai']) for q in history]
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
            {"$push": {"Qna": {
                "user_query": user_query,
                "ai": response_text,
                "created_at": str(datetime.datetime.now())
            }}}
        )
        return {
                "session_id": str(session),
                "ai": response_text,
                "subject": subject
            }
    except Exception as e:
        error_details = traceback.format_exc()  
        print(f"Error processing study assistant request: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing study assistant request: {str(e)}")
            