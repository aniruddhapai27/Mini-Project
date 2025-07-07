from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request, Depends
from controllers.assistant_controller import get_daily_questions, study_assistant, analyse_resume
from models.response_model import ChatResponse
from models.request_models import ChatRequest
from utils.helper import extract_text 
from auth import require_auth
from database.db_config import get_database
from bson import ObjectId

assistant_router = APIRouter()

@assistant_router.post("/daily-questions")
async def daily_questions():
    try:
        message = await get_daily_questions()
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching daily questions: {str(e)}")

@assistant_router.post("/chat", response_model= ChatResponse)
async def chat(chatRequest: ChatRequest, request: Request):
    try:
        if not chatRequest.user_query or not chatRequest.subject:
            raise HTTPException(status_code=400, detail="Query and subject are required fields.")
        
        # Get user ID from the request body (sent by Node.js server)
        user_id = str(chatRequest.user_id) if hasattr(chatRequest, 'user_id') else None
        
        if not user_id:
            raise HTTPException(status_code=403, detail="User ID is required.")
        
        response = await study_assistant(
            user_query=chatRequest.user_query,
            subject=chatRequest.subject,
            session_id=chatRequest.session_id,
            user_id=user_id
        )
        return ChatResponse(
            session_id=response.get('session_id', ''),
            response=response.get('response', ''),  # Changed from 'ai' to 'response'
            subject=chatRequest.subject
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@assistant_router.post("/resume")
async def resume_chat(file: UploadFile = File(...), current_user: dict = Depends(require_auth)):
    try:
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a text-based document.")
        
        # Use authenticated user ID
        user_id = current_user["_id"]
        
        resume_content = await analyse_resume(file, user_id)
        return {"message": "Resume processed successfully", "content": resume_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume file: {str(e)}")
    
@assistant_router.post( "/parser")
def parse_resume(file: UploadFile = File(...), current_user: dict = Depends(require_auth)):
    try:
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a text-based document.")
        resume_content = extract_text(file)
        return {"message": "Resume parsed successfully", "content": resume_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume file: {str(e)}")

@assistant_router.get("/history")
async def get_chat_history(request: Request, user_id: str = None):
    """Get user's chat history/sessions"""
    try:
        # Use user_id from query parameter or if not available, get it from the request
        if not user_id:
            user_id = request.headers.get("x-user-id")
            
        if not user_id:
            raise HTTPException(status_code=403, detail="User ID is required.")
        db = await get_database()
        collection = db['assistants']
        
        # Get all sessions for the user, sorted by creation date (newest first)
        sessions = await collection.find(
            {"user": ObjectId(user_id)},
            {"subject": 1, "createdAt": 1, "updatedAt": 1, "QnA": {"$slice": 1}}  # Only get first QnA for preview
        ).sort("createdAt", -1).to_list(length=50)
        
        # Format sessions for frontend
        formatted_sessions = []
        for session in sessions:
            formatted_sessions.append({
                "_id": str(session["_id"]),
                "subject": session.get("subject", "Unknown"),
                "createdAt": session.get("createdAt", ""),
                "updatedAt": session.get("updatedAt", ""),
                "preview": session.get("QnA", [{}])[0].get("user", "New chat") if session.get("QnA") else "New chat"
            })
        
        return {"sessions": formatted_sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")

@assistant_router.get("/session/{session_id}")
async def get_session_messages(session_id: str, request: Request, user_id: str = None):
    """Get messages for a specific session"""
    try:
        # Use user_id from query parameter or if not available, get it from the request
        if not user_id:
            user_id = request.headers.get("x-user-id")
            
        if not user_id:
            raise HTTPException(status_code=403, detail="User ID is required.")
        db = await get_database()
        collection = db['assistants']
        
        # Validate session_id format
        try:
            session_obj_id = ObjectId(session_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid session ID format")
        
        # Get session with all messages
        session = await collection.find_one({
            "_id": session_obj_id,
            "user": ObjectId(user_id)
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Format messages for frontend
        messages = []
        for qa in session.get("QnA", []):
            # Add user message
            messages.append({
                "type": "user",
                "content": qa.get("user", ""),
                "timestamp": qa.get("createdAt", "")
            })
            # Add assistant message
            messages.append({
                "type": "assistant", 
                "content": qa.get("bot", ""),
                "timestamp": qa.get("createdAt", "")
            })
        
        return {
            "session": {
                "_id": str(session["_id"]),
                "subject": session.get("subject", "Unknown"),
                "createdAt": session.get("createdAt", ""),
                "updatedAt": session.get("updatedAt", "")
            },
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching session: {str(e)}")

@assistant_router.delete("/session/{session_id}")
async def delete_session(session_id: str, request: Request, user_id: str = None):
    """Delete a specific session"""
    try:
        # Use user_id from query parameter or if not available, get it from the request
        if not user_id:
            user_id = request.headers.get("x-user-id")
            
        if not user_id:
            raise HTTPException(status_code=403, detail="User ID is required.")
        
        db = await get_database()
        collection = db['assistants']
        
        # Validate session_id format
        try:
            session_obj_id = ObjectId(session_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid session ID format")
        
        # Check if session exists and belongs to user
        session = await collection.find_one({
            "_id": session_obj_id,
            "user": ObjectId(user_id)
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Delete the session
        result = await collection.delete_one({
            "_id": session_obj_id,
            "user": ObjectId(user_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found or already deleted")
        
        return {"message": "Session deleted successfully", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")