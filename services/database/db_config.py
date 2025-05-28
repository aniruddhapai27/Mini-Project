from dotenv import load_dotenv
import os
from pymongo import MongoClient
import traceback

load_dotenv()

db_url = os.getenv("DB_URL")

def get_database():
    try:
        if not db_url:
            raise ValueError("DB_URL environment variable is not set and no default connection string available.")
        client = MongoClient(db_url, tlsInsecure=True)
        
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        db = client['mini_project']
        if db is None:
            raise Exception("Database connection failed. Please check your connection string.")
        return db
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error connecting to the database: {str(e)}\n{error_details}")
        raise Exception(f"Error connecting to the database: {str(e)}")

