"""
Authentication middleware that integrates with the centralized auth system.
This module provides backward compatibility for existing routes while 
using the updated authentication system with Swagger UI support.
"""

from fastapi import Depends
from auth import get_current_user, require_auth, optional_auth
from typing import Optional

# Export the centralized auth dependencies for use in routes
require_auth_dep = require_auth
optional_auth_dep = optional_auth
get_current_user_dep = get_current_user