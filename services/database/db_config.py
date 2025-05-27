from dotenv import load_dotenv
import os
from pymongo import MongoClient
import traceback

# Load environment variables but use hardcoded connection string as backup
load_dotenv()
# Use environment variable if available, otherwise use the hardcoded connection string
db_url = os.getenv("DB_URL", "mongodb+srv://channu:channu@cluster0.o1el2wt.mongodb.net/mini_project?retryWrites=true&w=majority&tls=true&appName=Cluster0")

def get_database():
    try:
        if not db_url:
            raise ValueError("DB_URL environment variable is not set and no default connection string available.")
        
        # Using the correct TLS parameters for PyMongo
        # tlsInsecure=True will skip certificate validation
        client = MongoClient(db_url, tlsInsecure=True)
        
        # Test connection to ensure it works
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # Using database name from connection string
        db = client.get_database()
        return db
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error connecting to the database: {str(e)}\n{error_details}")
        raise Exception(f"Error connecting to the database: {str(e)}")

