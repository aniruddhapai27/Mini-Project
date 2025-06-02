import jwt
import os
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from database.db_config import get_database
from bson import ObjectId
from typing import Optional

load_dotenv()

# JWT secret from Node.js server
JWT_SECRET = os.getenv("JWT_SECRET", "this_is_the_JWT_secret_123_mini")

class AuthMiddleware:
    """
    Authentication middleware that validates JWT tokens from Node.js server
    and extracts user information for FastAPI endpoints.
    """
    
    @staticmethod
    async def get_current_user(request: Request) -> Optional[dict]:
        """
        Extract and validate JWT token from cookies or Authorization header.
        Returns user data if valid, None if no token provided.
        Raises HTTPException if token is invalid.
        """
        try:
            # Try to get token from cookies first (matching Node.js implementation)
            token = request.cookies.get("jwt")
            
            # If no cookie, try Authorization header
            if not token:
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
            
            # If still no token, return None (endpoint can decide if auth is required)
            if not token:
                return None
            
            # Verify and decode the JWT token
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired. Please log in again."
                )
            except jwt.InvalidTokenError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token. Please log in again."
                )
            
            # Extract user ID from payload
            user_id = payload.get("userId")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload. Please log in again."
                )
            
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
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            print(f"Auth middleware error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during authentication"
            )
    
    @staticmethod
    async def require_auth(request: Request) -> dict:
        """
        Require authentication. Raises HTTPException if not authenticated.
        """
        user = await AuthMiddleware.get_current_user(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="You are not logged in. Please log in to access this resource."
            )
        return user
    
    @staticmethod
    async def optional_auth(request: Request) -> Optional[dict]:
        """
        Optional authentication. Returns user if authenticated, None otherwise.
        Does not raise exception if not authenticated.
        """
        try:
            return await AuthMiddleware.get_current_user(request)
        except HTTPException as e:
            # If authentication fails, return None for optional auth
            if e.status_code == status.HTTP_401_UNAUTHORIZED:
                return None
            # Re-raise other errors (like server errors)
            raise


class OptionalAuthBearer(HTTPBearer):
    """
    Optional HTTP Bearer authentication.
    """
    def __init__(self, auto_error: bool = False):
        super(OptionalAuthBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        try:
            return await super(OptionalAuthBearer, self).__call__(request)
        except HTTPException:
            return None


# Dependency functions for FastAPI routes
async def get_current_user_dep(request: Request) -> Optional[dict]:
    """Dependency to get current user (optional)"""
    return await AuthMiddleware.optional_auth(request)

async def require_auth_dep(request: Request) -> dict:
    """Dependency to require authentication"""
    return await AuthMiddleware.require_auth(request)