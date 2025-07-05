# FastAPI Authentication Guide

This guide explains how to authenticate with the FastAPI services using JWT tokens.

## How to Get a JWT Token

1. **Login through your Node.js frontend application**
2. **Extract the JWT token from the login response**

Example login response:
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ0NmUzMWVkZWE4ZTBmZmRmOWQ4MTYiLCJpYXQiOjE3NTE2OTcwNzgsImV4cCI6MTc1MjU2MTA3OH0.K0lEaW5mDA53OgC_oTa1si6_CpQ43a5uDuaANDIHMX0",
    "user": { ... },
    "message": "User logged in successfully"
}
```

## Using the Token with FastAPI Docs (Swagger UI)

1. **Start your FastAPI service:**
   ```bash
   cd services
   python api.py
   ```

2. **Open the Swagger UI:** 
   Navigate to `http://localhost:8000/services/docs`

3. **Authenticate:**
   - Click the **"Authorize"** button (🔒) in the top right
   - In the "HTTPBearer (http, Bearer)" section, enter your JWT token
   - Click **"Authorize"**
   - Click **"Close"**

4. **Test Authentication:**
   - Try the `/auth-test` endpoint to verify your token works
   - You should see your user information in the response

## Using the Token with API Calls

### Method 1: Authorization Header (Recommended)
```bash
curl -X GET "http://localhost:8000/services/auth-test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Method 2: Cookie (for web applications)
If your application sets the JWT token as a cookie named `jwt`, it will be automatically used.

## Protected Endpoints

All endpoints under `/api/v1/interview` and `/api/v1/assistant` require authentication:

- `/api/v1/interview/transcript` - Convert voice to text
- `/api/v1/interview/text-to-speech` - Convert text to speech
- `/api/v1/interview/feedback` - Get interview feedback
- `/api/v1/assistant/chat` - Chat with AI assistant
- `/api/v1/assistant/daily-questions` - Get daily questions

## Example Usage

### JavaScript/Frontend
```javascript
const token = "YOUR_JWT_TOKEN";

const response = await fetch('/services/api/v1/interview/transcript', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: formData
});
```

### Python
```python
import requests

token = "YOUR_JWT_TOKEN"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:8000/services/auth-test",
    headers=headers
)
```

## Troubleshooting

### Common Issues:

1. **"Could not validate credentials"**
   - Check that your token is valid and not expired
   - Ensure you're including the "Bearer " prefix

2. **"Token has expired"**
   - Login again to get a new token
   - Tokens are valid for a limited time

3. **"User not found"**
   - The user associated with the token may have been deleted
   - Try logging in again

### Testing Your Setup:

1. Use the `/auth-test` endpoint to verify authentication
2. Check the browser's developer tools for any CORS issues
3. Verify the token format in the Network tab

## Security Notes

- Never expose JWT tokens in client-side code or logs
- Tokens should be stored securely (httpOnly cookies recommended)
- Always use HTTPS in production
- Tokens have expiration times for security
