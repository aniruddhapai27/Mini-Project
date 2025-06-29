#!/usr/bin/env python3
"""
Test the interview workflow with actual running services
"""

import requests
import json
import io

def test_interview_endpoint():
    """Test the interview endpoint directly"""
    
    print("🧪 Testing Interview Endpoint")
    print("=" * 50)
    
    # Test the Python service directly
    url = "http://localhost:8000/api/v1/interview/resume-based"
    
    # Create a simple test file
    test_content = b"John Doe\nSoftware Engineer\nExperience: 5 years in web development\nSkills: Python, JavaScript, React"
    
    files = {
        'file': ('test_resume.txt', io.BytesIO(test_content), 'text/plain')
    }
    
    data = {
        'domain': 'webdev',
        'difficulty': 'medium',
        'user_response': 'Hello, I am ready to start the interview.',
        'session': None
    }
    
    # Note: This test won't work without authentication, but it will show us the error
    try:
        response = requests.post(url, files=files, data=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Interview endpoint working correctly!")
        else:
            print(f"❌ Interview endpoint returned error: {response.status_code}")
            
    except requests.RequestException as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_interview_endpoint()
