#!/usr/bin/env python3

import requests
import json
import os
from pathlib import Path

# Test configuration
BASE_URL = "http://localhost:8000"
HEADERS = {
    "Authorization": "Bearer test_token_123"
}

def test_fallback_session():
    """Test that fallback session IDs don't cause 500 errors"""
    
    # Create a test resume file
    test_resume_path = Path("test_resume.txt")
    test_resume_path.write_text("John Doe\nSoftware Engineer\nExperience: Python, JavaScript, React")
    
    try:
        url = f"{BASE_URL}/api/v1/interview/resume-based"
        
        # Test with fallback session ID
        data = {
            "domain": "software-engineering",
            "difficulty": "medium", 
            "user_response": "Hello, I am ready to start the interview.",
            "session": "fallback_1751190649559_70vkiuikh"  # This should not cause 500 error
        }
        
        with open(test_resume_path, 'rb') as f:
            files = {"file": ("resume.txt", f, "text/plain")}
            
            print(f"🧪 Testing fallback session ID: {data['session']}")
            response = requests.post(url, data=data, files=files, headers=HEADERS)
            
            print(f"📋 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ SUCCESS: Fallback session handled correctly!")
                response_data = response.json()
                print(f"📝 Response: {response_data.get('response', 'N/A')[:200]}...")
            elif response.status_code == 500:
                print("❌ FAILED: Still getting 500 error")
                print(f"Error: {response.text}")
            else:
                print(f"⚠️  Unexpected status code: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Test failed with exception: {str(e)}")
    finally:
        # Clean up
        if test_resume_path.exists():
            test_resume_path.unlink()

if __name__ == "__main__":
    test_fallback_session()
