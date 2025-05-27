from groq import Groq
from dotenv import load_dotenv
import os
import datetime
from fastapi import HTTPException
import traceback
from database.db_config import get_database
from utils.helper import extract_json_objects

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY_DQ")
client = Groq(api_key = groq_api_key)

prompt = (
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

def get_daily_questions():
    try:
        subjects = ["Data Structures"]
        daily_questions = []
        db = get_database()
        for subject in subjects:
            collection = db['Daily_Questions']
            existing_questions_cursor = collection.find({'subject': subject})
            existing_questions = list(existing_questions_cursor)
            existing_questions_list = [q['question'] for q in existing_questions]
            response  = client.chat.completions.create(
                model = "meta-llama/llama-4-scout-17b-16e-instruct",
                messages = [
                    {
                        "role" : "system",
                        "content" : prompt.format(subject=subject, list=existing_questions_list)
                        
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
        collection.insert_many(daily_questions)
        return {"message": "Daily questions successfully stored  in the database."}
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error fetching daily questions: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")