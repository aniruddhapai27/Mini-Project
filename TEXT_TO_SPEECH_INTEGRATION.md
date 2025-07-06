# Text-to-Speech Integration for Mock Interview

This document explains the text-to-speech (TTS) functionality added to the mock interview feature.

## Overview

The TTS feature allows users to listen to AI-generated interview questions using high-quality voice synthesis. The feature includes:

- 🔊 Manual play/stop controls for each AI message
- 🔄 Auto-play toggle for new AI responses
- 🎵 High-quality voice synthesis using Aaliyah-PlayAI voice
- 🔇 Audio controls and management

## Architecture

### Backend (Node.js)

**File**: `server/controllers/interviewController.js`

- **Function**: `textToSpeech`
- **Route**: `POST /api/interview/text-to-speech`
- **Purpose**: Proxy requests to Python TTS service with authentication

**Key Features**:

- Cookie-based authentication forwarding
- Audio stream handling (arraybuffer response)
- Error handling and timeout management
- Proper audio headers for client playback

**File**: `server/routes/interviewRoutes.js`

- Added route for text-to-speech endpoint
- Protected by authentication middleware

### Frontend (React)

**File**: `client/src/utils/textToSpeech.js`

- **Functions**: `textToSpeech`, `playTextToSpeech`, `stopAudio`
- **Purpose**: Handle TTS API calls and audio playback

**File**: `client/src/pages/MockInterview.jsx`

- Integrated TTS controls into message display
- Auto-play functionality with user toggle
- Audio state management

## Usage

### Manual Control

Each AI message displays a "🔊 Listen" button that:

- Converts text to speech using the backend API
- Plays audio immediately
- Shows "Stop" button during playback
- Handles audio cleanup automatically

### Auto-Play

Users can toggle auto-play functionality:

- **Enabled**: New AI messages play automatically after 1-second delay
- **Disabled**: Only manual play is available
- Toggle button in chat header shows current state

### Voice Selection

Currently configured to use:

- **Default Voice**: "Aaliyah-PlayAI"
- **Fallback**: Standard voice if primary fails

## API Integration

### Request Flow

1. **Frontend** → **Node.js Backend** → **Python TTS Service**
2. Authentication token passed via cookies
3. Audio data streamed back through the chain
4. Frontend receives audio blob for playback

### Request Format

```javascript
POST /api/interview/text-to-speech
{
  "text": "Hello, this is the interview question...",
  "voice": "Aaliyah-PlayAI"
}
```

### Response

- **Content-Type**: `audio/mpeg`
- **Body**: Audio stream (arraybuffer)
- **Headers**: Proper caching and content-length headers

## Error Handling

### Backend Errors

- Authentication token validation
- Request timeout (30 seconds)
- Python service connectivity
- Audio stream processing

### Frontend Errors

- Audio playback failures
- Network connectivity issues
- Browser compatibility checks
- Graceful degradation

## Browser Compatibility

**Supported Features**:

- Modern browsers with Audio API
- Fetch API with credentials
- Blob URL creation
- Event listeners for audio controls

**Fallbacks**:

- Feature detection for TTS support
- Graceful hiding of controls if unsupported
- Error messages for unsupported browsers

## Configuration

### Environment Variables

**Frontend** (`.env`):

```env
VITE_API_URL=http://localhost:5000
```

**Backend**:

- Inherits from existing cookie and auth configuration
- Uses existing CORS settings for credentials

### Voice Configuration

Located in `textToSpeech.js`:

```javascript
const defaultVoice = "Aaliyah-PlayAI";
```

## Testing

### Manual Testing

1. Start the mock interview
2. Wait for AI response
3. Click "🔊 Listen" button
4. Verify audio plays correctly
5. Test stop functionality
6. Toggle auto-play and verify behavior

### Automated Testing

Use the test utility:

```javascript
// In browser console
window.testTTS.basic(); // Test basic functionality
window.testTTS.voices(); // Test different voices
```

## Performance Considerations

### Audio Caching

- Audio blobs are created temporarily
- Object URLs cleaned up after playback
- No persistent caching to save memory

### Network Optimization

- 30-second timeout for TTS requests
- Proper error handling for slow connections
- Audio streaming for immediate playback

### Memory Management

- Audio elements cleaned up on component unmount
- Object URLs revoked after use
- Event listeners properly removed

## Security

### Authentication

- Cookies passed securely to backend
- Token validation on every request
- No token exposure in frontend code

### Content Security

- Audio content type validation
- Proper CORS configuration
- Secure audio blob handling

## Future Enhancements

### Possible Improvements

1. **Voice Selection**: User choice of different voices
2. **Speed Control**: Adjustable playback speed
3. **Audio Caching**: Cache frequently used responses
4. **Offline Support**: Download audio for offline use
5. **Accessibility**: Screen reader integration
6. **Analytics**: Track TTS usage patterns

### Code Locations for Enhancements

- **Voice Selection**: Update `textToSpeech.js` and add UI controls
- **Speed Control**: Modify audio element properties in playback function
- **Caching**: Implement localStorage or IndexedDB in `textToSpeech.js`
- **Analytics**: Add tracking calls in TTS event handlers

## Troubleshooting

### Common Issues

1. **No Audio Playback**

   - Check browser audio permissions
   - Verify backend service is running
   - Check network connectivity
   - Verify authentication cookies

2. **Authentication Errors**

   - Ensure user is logged in
   - Check cookie configuration
   - Verify token expiration

3. **Performance Issues**
   - Check Python TTS service status
   - Monitor network timeout settings
   - Verify audio codec support

### Debug Information

Enable debug logging by:

```javascript
// In browser console
localStorage.setItem("debug", "tts:*");
```

## Implementation Notes

- **Non-blocking**: TTS doesn't interfere with typing or user interaction
- **Responsive**: Works on both desktop and mobile devices
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Progressive**: Gracefully degrades when not supported

This implementation provides a robust, user-friendly text-to-speech experience that enhances the mock interview functionality while maintaining performance and accessibility standards.
