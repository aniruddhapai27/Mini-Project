#!/usr/bin/env python3
"""
FastAPI Authentication Test Script

This script demonstrates how to authenticate with the FastAPI services
using the JWT token from your login response.

Usage:
    python test_auth.py YOUR_JWT_TOKEN
"""

import sys
import requests
import json

def test_authentication(token):
    """Test FastAPI authentication with the provided JWT token"""
    
    # API base URL
    base_url = "http://localhost:8000/services"
    
    # Headers with authorization
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("🔐 Testing FastAPI JWT Authentication")
    print("=" * 50)
    
    # Test 1: Root endpoint (no auth required)
    print("\n1. Testing root endpoint (no auth required)...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Auth test endpoint (auth required)
    print("\n2. Testing auth-test endpoint (auth required)...")
    try:
        response = requests.get(f"{base_url}/auth-test", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Authentication successful!")
            print(f"   User ID: {data.get('user_id')}")
            print(f"   User Name: {data.get('user_name')}")
            print(f"   User Email: {data.get('user_email')}")
        else:
            print(f"   ❌ Authentication failed: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Interview endpoint (auth required)
    print("\n3. Testing protected interview endpoint...")
    try:
        # This would normally require file upload, so we'll just test access
        response = requests.post(f"{base_url}/api/v1/interview/text-to-speech", 
                               headers=headers,
                               json={"text": "Hello", "voice": "alloy"})
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 422]:  # 422 is validation error, which means auth worked
            print(f"   ✅ Endpoint accessible (authentication successful)")
        else:
            print(f"   ❌ Access denied: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("📝 How to use in Swagger UI:")
    print("1. Open http://localhost:8000/services/docs")
    print("2. Click the 'Authorize' button (🔒)")
    print("3. Enter your JWT token in the 'Value' field")
    print("4. Click 'Authorize' then 'Close'")
    print("5. Try the /auth-test endpoint")

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_auth.py YOUR_JWT_TOKEN")
        print("\nExample:")
        print("python test_auth.py eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ0NmUzMWVkZWE4ZTBmZmRmOWQ4MTYiLCJpYXQiOjE3NTE2OTcwNzgsImV4cCI6MTc1MjU2MTA3OH0.K0lEaW5mDA53OgC_oTa1si6_CpQ43a5uDuaANDIHMX0")
        sys.exit(1)
    
    token = sys.argv[1]
    
    # Basic token validation
    if not token or len(token.split('.')) != 3:
        print("❌ Invalid JWT token format. Token should have 3 parts separated by dots.")
        sys.exit(1)
    
    test_authentication(token)

if __name__ == "__main__":
    main()
