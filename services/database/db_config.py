from dotenv import load_dotenv
import os 
from pymongo import MongoClient
import traceback
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
db_url = os.getenv("DB_URL")

async def get_database():
    try:
        if not db_url:
            raise ValueError("DB_URL environment variable is not set.")
        client = AsyncIOMotorClient(db_url)
        db = client['mini_project']
        return db
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error connecting to the database: {str(e)}\n{error_details}")
        raise Exception(f"Error connecting to the database: {str(e)}")

