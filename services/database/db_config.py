from dotenv import load_dotenv
import os
from pymongo import MongoClient
import traceback
import certifi # certifi might still be used by pymongo for TLS

load_dotenv()
db_url = os.getenv("DB_URL")

def get_database(): # Removed async
    try:
        if not db_url:
            raise ValueError("DB_URL environment variable is not set.")
        # Changed AsyncIOMotorClient to MongoClient and removed tls/tlsCAFile,
        # assuming db_url contains necessary SSL/TLS config or pymongo handles it.
        # If issues arise, specific tls options for pymongo might be needed.
        client = MongoClient(db_url)
        db = client['mini_project']
        return db
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error connecting to the database: {str(e)}\n{error_details}")
        raise Exception(f"Error connecting to the database: {str(e)}")

