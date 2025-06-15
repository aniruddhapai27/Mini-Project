# Interview Session API Documentation

## Overview
This API provides comprehensive interview session management including session creation, Q&A flow management, conversation history, feedback, and analytics.

## Base URL
```
/api/v1/interview
```

## Authentication
All endpoints require user authentication via JWT token in cookies.

## Endpoints

### 1. Create Interview Session
**POST** `/sessions`

Creates a new interview session for the authenticated user.

**Request Body:**
```json
{
  "domain": "Software Engineering",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview session created successfully",
  "data": {
    "sessionId": "64a7b8c9d1234567890abcde",
    "domain": "Software Engineering",
    "difficulty": "medium",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Interview Session
**GET** `/sessions/:sessionId`

Retrieves complete interview session data including metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "domain": "Software Engineering",
    "difficulty": "medium",
    "QnA": [...],
    "feedBack": "",
    "score": 0,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Interview Conversation
**GET** `/sessions/:sessionId/conversation`

Retrieves only the conversation history for a specific session.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "64a7b8c9d1234567890abcde",
    "domain": "Software Engineering",
    "difficulty": "medium",
    "conversation": [
      {
        "bot": "Tell me about yourself",
        "user": "I am a software developer...",
        "createdAt": "2025-01-15T10:35:00.000Z"
      }
    ],
    "totalQuestions": 1,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Interview Session (Add Q&A)
**PATCH** `/sessions/:sessionId`

Adds a new question-answer pair to the interview session.

**Request Body:**
```json
{
  "bot": "What is your experience with React?",
  "user": "I have 3 years of experience with React..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview session updated successfully",
  "data": {
    "sessionId": "64a7b8c9d1234567890abcde",
    "latestQnA": {
      "bot": "What is your experience with React?",
      "user": "I have 3 years of experience with React...",
      "createdAt": "2025-01-15T10:40:00.000Z"
    },
    "totalQuestions": 2
  }
}
```

### 5. End Interview Session
**PATCH** `/sessions/:sessionId/end`

Marks an interview session as completed with final score and feedback.

**Request Body:**
```json
{
  "finalScore": 85,
  "feedback": "Good technical knowledge, needs improvement in communication"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview session ended successfully",
  "data": {
    "sessionId": "64a7b8c9d1234567890abcde",
    "totalQuestions": 5,
    "finalScore": 85,
    "feedback": "Good technical knowledge, needs improvement in communication",
    "domain": "Software Engineering",
    "difficulty": "medium"
  }
}
```

### 6. Update Interview Feedback
**PATCH** `/sessions/:sessionId/feedback`

Updates feedback and score for a specific interview session.

**Request Body:**
```json
{
  "feedback": "Excellent performance in technical questions",
  "score": 92
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview feedback updated successfully",
  "data": {
    "sessionId": "64a7b8c9d1234567890abcde",
    "feedback": "Excellent performance in technical questions",
    "score": 92
  }
}
```

### 7. Get User Interview History
**GET** `/history`

Retrieves paginated interview history for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `domain` (optional): Filter by domain
- `difficulty` (optional): Filter by difficulty

**Response:**
```json
{
  "success": true,
  "data": {
    "interviews": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 8. Get Recent Interviews
**GET** `/recent`

Retrieves the most recent interview sessions for quick access.

**Query Parameters:**
- `limit` (optional): Number of recent interviews (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "64a7b8c9d1234567890abcde",
      "domain": "Software Engineering",
      "difficulty": "medium",
      "score": 85,
      "questionsCount": 5,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "status": "completed"
    }
  ]
}
```

### 9. Get Interview Statistics
**GET** `/stats`

Provides comprehensive statistics about user's interview performance.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalInterviews": 15,
      "averageScore": 78.5,
      "totalQuestions": 75
    },
    "domainBreakdown": [
      {
        "domain": "Software Engineering",
        "count": 8,
        "averageScore": 82.3
      }
    ],
    "difficultyBreakdown": [
      {
        "difficulty": "medium",
        "count": 10,
        "averageScore": 79.2
      }
    ]
  }
}
```

### 10. Delete Interview Session
**DELETE** `/sessions/:sessionId`

Permanently deletes an interview session.

**Response:**
```json
{
  "success": true,
  "message": "Interview session deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error status codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - User not authenticated
- `404`: Not Found - Session not found
- `500`: Internal Server Error - Server-side error

## Usage Examples

### Creating and Managing an Interview Session

1. **Create Session:**
```bash
POST /api/v1/interview/sessions
{
  "domain": "Data Science",
  "difficulty": "hard"
}
```

2. **Add Q&A:**
```bash
PATCH /api/v1/interview/sessions/SESSION_ID
{
  "bot": "Explain the difference between supervised and unsupervised learning",
  "user": "Supervised learning uses labeled data..."
}
```

3. **End Session:**
```bash
PATCH /api/v1/interview/sessions/SESSION_ID/end
{
  "finalScore": 88,
  "feedback": "Strong understanding of ML concepts"
}
```

### Retrieving History and Analytics

1. **Get Recent Interviews:**
```bash
GET /api/v1/interview/recent?limit=3
```

2. **Get Detailed History:**
```bash
GET /api/v1/interview/history?domain=Data%20Science&page=1&limit=5
```

3. **Get Performance Stats:**
```bash
GET /api/v1/interview/stats
```
