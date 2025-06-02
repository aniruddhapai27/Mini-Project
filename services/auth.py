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
    print(f"Attempting to authenticate user. Initial token from cookie ('{COOKIE_NAME}'): {'SET' if token else 'NOT SET'}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials (token missing/invalid)",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # If no token from cookie, try Authorization header as fallback
    if token is None and request:
        auth_header = request.headers.get("Authorization")
        print(f"No token in cookie. Authorization header: {auth_header}")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            print(f"Token extracted from Authorization header: {'SET' if token else 'NOT SET'}")
        else:
            print("No 'Bearer ' token found in Authorization header.")

    if token is None:
        print("No token found in cookie or Authorization header. Authentication failed.")
        return None

    print(f"Token found, attempting to decode (first 20 chars): {token[:20]}...")
    try:
        # Verify and decode the JWT token (compatible with Node.js)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token decoded successfully. Payload: {payload}")
        user_id: str = payload.get("userId")  # Node.js uses "userId" in payload
        
        if user_id is None:
            print("Error: 'userId' not found in token payload.")
            raise credentials_exception

        print(f"Extracted userId from token: {user_id}")
        # Get user from database
        db = await get_database()
        user_collection = db['users']
        
        print(f"Attempting to find user in DB with _id: {user_id}")
        try:
            user = await user_collection.find_one(
                {"_id": ObjectId(user_id)},
                {"password": 0, "__v": 0}  # Exclude sensitive fields
            )
        except Exception as e:
            print(f"Database error while fetching user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while fetching user"
            )
        
        if not user:
            print(f"User with _id '{user_id}' not found in database.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please log in again."
            )
        
        print(f"User found in database: {user.get('email')}")
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return user
        
    except jwt.ExpiredSignatureError:
        print("Token validation failed: Token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again."
        )
    except jwt.InvalidTokenError as e:
        print(f"Token validation failed: Invalid token. Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please log in again."
        )
    except Exception as e:
        print(f"An unexpected error occurred during authentication: {str(e)}")
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
