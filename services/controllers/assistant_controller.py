from groq import Groq
from dotenv import load_dotenv
import os
import datetime
from fastapi import HTTPException
from bson import ObjectId
import traceback
from database.db_config import get_database
from utils.helper import extract_json_objects, init_retriever, init_rag_chain, get_model

load_dotenv()
groq_api_key_dq = os.getenv("GROQ_API_KEY_DQ")
client = Groq(api_key = groq_api_key_dq)

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


async def chat_with_ai(user_query: str, subject: str, session_id: str = None):
    try:
        db = await get_database()
        collection = db['Interviewer']
        session = session_id
        if not session:
            new_session = {
                "domain": subject,
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
        chat, embeddings = get_model()
        _, retriever = init_retriever(chat, embeddings, subject)
        rag_chain = init_rag_chain(chat, retriever, subject)
        rag_history = [(q['user_query'], q['ai']) for q in history]
        rag_input = {"input": user_query, "chat_history": rag_history}
        rag_response = rag_chain.invoke(rag_input)
        answer = rag_response["answer"] if isinstance(rag_response, dict) and "answer" in rag_response else rag_response
        await collection.update_one({"_id": session}, {"$push": {"Qna": {
            "user_query": user_query,
            "ai": answer,
            "created_at": str(datetime.datetime.now())
        }}})
        return {
            "session_id": str(session),
            "ai": answer
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error processing RAG AI chat: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing RAG AI chat: {str(e)}")