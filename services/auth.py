import jwt
import os
from fastapi import HTTPException, Request, status, Depends
from fastapi.security import APIKeyCookie
from dotenv import load_dotenv
from database.db_config import get_database
from bson import ObjectId
from typing import Optional

load_dotenv()

# JWT Configuration - MUST MATCH with Express backend
SECRET_KEY = os.getenv("JWT_SECRET", "this_is_the_JWT_secret_123_mini")
ALGORITHM = "HS256"
COOKIE_NAME = "jwt"

# Swagger support for cookie authentication
api_key_cookie = APIKeyCookie(name=COOKIE_NAME, auto_error=False)

async def get_current_user(token: str = Depends(api_key_cookie), request: Request = None) -> Optional[dict]:
    """
    Extract and validate JWT token from cookies or Authorization header.
    Compatible with Node.js Express backend authentication.
    Returns user data if valid, None if no token provided.
    Raises HTTPException if token is invalid.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials (token missing/invalid)",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # If no token from cookie, try Authorization header as fallback
    if token is None and request:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if token is None:
        return None

    try:
        # Verify and decode the JWT token (compatible with Node.js)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId")  # Node.js uses "userId" in payload
        
        if user_id is None:
            raise credentials_exception

        # Get user from database
        db = await get_database()
        user_collection = db['users']
        
        try:
            user = await user_collection.find_one(
                {"_id": ObjectId(user_id)},
                {"password": 0, "__v": 0}  # Exclude sensitive fields
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while fetching user"
            )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please log in again."
            )
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please log in again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

async def require_auth(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that requires authentication.
    Raises HTTPException if user is not authenticated.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not logged in. Please log in to access this resource."
        )
    return current_user

async def optional_auth(current_user: dict = Depends(get_current_user)) -> Optional[dict]:
    """
    Dependency for optional authentication.
    Returns user if authenticated, None otherwise.
    """
    return current_user
