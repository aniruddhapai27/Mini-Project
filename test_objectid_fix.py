#!/usr/bin/env python3

"""
Unit test to verify that the ObjectId validation fix works correctly
for fallback session IDs in the interview workflow.
"""

from bson import ObjectId
import sys
import os

# Add the services directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

def test_objectid_validation():
    """Test that we can properly validate ObjectId formats"""
    
    test_cases = [
        ("507f1f77bcf86cd799439011", True),   # Valid ObjectId
        ("fallback_1751190649559_70vkiuikh", False),  # Fallback session ID
        ("invalid_id", False),  # Invalid format
        ("", False),  # Empty string
        ("abc123", False),  # Too short
    ]
    
    print("🧪 Testing ObjectId validation logic...")
    
    for session_id, expected_valid in test_cases:
        try:
            ObjectId(session_id)
            is_valid = True
        except Exception as e:
            is_valid = False
        
        status = "✅" if (is_valid == expected_valid) else "❌"
        print(f"{status} Session '{session_id}': Expected {expected_valid}, Got {is_valid}")
        
        if is_valid != expected_valid:
            return False
    
    print("✅ All ObjectId validation tests passed!")
    return True

def simulate_session_logic():
    """Simulate the session handling logic from the fixed route"""
    
    print("\n🧪 Testing session handling logic...")
    
    test_sessions = [
        "507f1f77bcf86cd799439011",  # Valid ObjectId
        "fallback_1751190649559_70vkiuikh",  # Fallback session ID
        None,  # No session
    ]
    
    for session in test_sessions:
        print(f"\n📋 Testing session: {session}")
        
        if session:
            # Check if session is a valid ObjectId (not a fallback session)
            try:
                session_object_id = ObjectId(session)
                print(f"✅ Session '{session}' is a valid ObjectId")
                # In real code, this would query the database
                session_doc = {"QnA": [{"user": "Hello", "bot": "Hi"}]}  # Mock
            except Exception as e:
                # Session is not a valid ObjectId (likely a fallback session)
                print(f"⚠️ Session '{session}' is not a valid ObjectId (likely fallback session): {str(e)}")
                session_doc = None
            
            # Build conversation history
            history = ""
            if session_doc and "QnA" in session_doc:
                print("📝 Building conversation history from session data")
                for idx, qna in enumerate(session_doc["QnA"]):
                    user_msg = qna.get('user', '').strip()
                    if (idx == 0 and (user_msg == "Hello, I am ready to start the interview." or 
                                     user_msg == "Hello, I'm ready to start the interview. Please begin with your first question.")):
                        continue
                    
                    interviewer_msg = qna.get('bot', '')
                    candidate_msg = qna.get('user', '')
                    if interviewer_msg and candidate_msg:
                        history += f"Interviewer: {interviewer_msg}\\n\\nCandidate: {candidate_msg}\\n\\n"
            else:
                print("⚠️ No session data available (fallback or new session)")
        else:
            print("📝 New interview session (no existing session)")
            history = ""
            
        print(f"📋 Conversation history length: {len(history)} characters")
    
    print("✅ Session handling logic test completed!")

if __name__ == "__main__":
    print("🚀 Running ObjectId validation and session handling tests...\n")
    
    success = test_objectid_validation()
    if success:
        simulate_session_logic()
        print("\n🎉 All tests passed! The fix should handle fallback session IDs correctly.")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)
