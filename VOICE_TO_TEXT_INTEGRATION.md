# Voice-to-Text Integration for Mock Interview

This document explains the voice-to-text functionality added to the mock interview feature, allowing users to speak their responses instead of typing.

## Overview

The voice-to-text feature allows users to:

- 🎤 Record audio responses using their microphone
- 📝 Convert voice recordings to text automatically
- ✏️ Edit the transcribed text before sending
- 🔄 Seamlessly switch between typing and voice input

## Architecture

### Backend (Node.js)

**File**: `server/controllers/interviewController.js`

- **Function**: `voiceToText`
- **Route**: `POST /api/v1/interview/voice-to-text`
- **Purpose**: Proxy voice-to-text requests to Python service with authentication

**Key Features**:

- Multer middleware for audio file handling
- Cookie-based authentication forwarding
- Audio file validation and processing
- Error handling and timeout management

**File**: `server/routes/interviewRoutes.js`

- Added multer configuration for audio uploads
- Added route for voice-to-text endpoint
- Protected by authentication middleware

### Python Service

**Endpoint**: `https://my-project.tech/services/api/v1/interview/transcript`

- Uses Groq's Whisper model for transcription
- Supports various audio formats (WAV, MP3, FLAC)
- Provides high-quality speech-to-text conversion

### Frontend (React)

**File**: `client/src/utils/voiceToText.js`

- **Functions**: `voiceToText`, `startRecording`, `stopRecording`, `recordAudio`
- **Purpose**: Handle voice recording and transcription API calls

**File**: `client/src/components/VoiceRecorder.jsx`

- Reusable voice recording component
- Visual feedback for recording state
- Timer display during recording
- Processing indicator

**File**: `client/src/pages/MockInterview.jsx`

- Integrated voice recorder in input area
- Automatic text insertion after transcription
- Seamless UX with existing typing functionality

## Usage

### Voice Recording Process

1. **Start Recording**: Click the microphone button in the input area
2. **Recording State**:
   - Button turns red and shows recording icon
   - Timer displays recording duration
   - Red pulse indicator shows active recording
3. **Stop Recording**: Click the button again to stop
4. **Processing**:
   - Button shows spinner while converting voice to text
   - "Converting..." indicator appears
5. **Result**: Transcribed text appears in the input field

### User Experience

- **Visual Feedback**: Clear indicators for recording, processing, and completion
- **Error Handling**: Graceful fallback if voice recording fails
- **Browser Support**: Automatic detection of browser capabilities
- **Permissions**: Requests microphone access when needed

### Controls

- **🎤 Microphone Button**: Start/stop voice recording
- **Timer**: Shows recording duration
- **Processing Indicator**: Shows conversion progress

## API Integration

### Request Flow

1. **Frontend** → **Node.js Backend** → **Python Transcript Service**
2. Authentication token passed via cookies
3. Audio data processed and transcribed
4. Text returned through the chain
5. Frontend receives transcribed text

### Request Format

```javascript
POST /api/v1/interview/voice-to-text
Content-Type: multipart/form-data

FormData:
- audio: [audio file blob]
```

### Response Format

```json
{
  "success": true,
  "data": {
    "text": "Transcribed text from the audio recording"
  }
}
```

## Browser Compatibility

**Supported Features**:

- MediaRecorder API for audio recording
- getUserMedia for microphone access
- Fetch API with FormData
- Blob handling for audio data

**Requirements**:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTTPS connection (required for microphone access)
- Microphone permissions

**Fallbacks**:

- Feature detection hides voice button if unsupported
- Graceful degradation to text-only input
- Error messages for unsupported browsers

## Configuration

### Audio Settings

Located in `voiceToText.js`:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});
```

### File Upload Limits

Located in `interviewRoutes.js`:

```javascript
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"), false);
    }
  },
});
```

## Testing

### Manual Testing

1. Navigate to mock interview page
2. Start an interview session
3. Click the microphone button in input area
4. Grant microphone permissions if prompted
5. Speak clearly for a few seconds
6. Click stop recording
7. Verify transcribed text appears in input field
8. Edit text if needed and send response

### Automated Testing

Use the test utility:

```javascript
// In browser console
window.testVoiceToText.basic(); // Test browser support
window.testVoiceToText.mockData(); // Test with mock audio
```

## Error Handling

### Frontend Errors

- **Microphone Access Denied**: Shows error message
- **Unsupported Browser**: Hides voice button
- **Recording Failed**: Falls back to text input
- **Network Issues**: Displays error notification

### Backend Errors

- **Authentication Failed**: Returns 401 with message
- **Invalid Audio File**: Returns 400 with validation error
- **Transcription Failed**: Returns 500 with service error
- **Timeout**: Returns 408 with timeout message

### Python Service Errors

- **Audio Processing**: Handled by Groq Whisper service
- **Network Issues**: Handled with retries and fallbacks

## Performance Considerations

### Audio Processing

- Audio recorded in WebM or MP4 format
- Automatic compression for smaller file sizes
- 10MB file size limit to prevent issues

### Network Optimization

- 30-second timeout for transcription requests
- Proper error handling for slow connections
- Audio streaming for immediate processing

### Memory Management

- Audio blobs cleaned up after processing
- MediaRecorder streams properly closed
- Event listeners removed on component unmount

## Security

### Authentication

- Cookies passed securely to backend
- Token validation on every request
- No token exposure in frontend code

### File Security

- Audio files validated before processing
- Temporary storage only during processing
- No persistent audio storage

### Privacy

- Audio data processed server-side only
- No audio storage beyond transcription
- User consent required for microphone access

## Future Enhancements

### Possible Improvements

1. **Real-time Transcription**: Live transcription during recording
2. **Language Detection**: Automatic language detection
3. **Voice Commands**: Special commands for interview actions
4. **Audio Quality**: Noise reduction and enhancement
5. **Offline Support**: Local transcription capabilities
6. **Voice Analytics**: Speech pattern analysis for feedback

### Code Locations for Enhancements

- **Real-time Features**: Modify `VoiceRecorder.jsx` and WebSocket integration
- **Language Support**: Update Python service configuration
- **Quality Improvements**: Enhance audio processing in `voiceToText.js`
- **Analytics**: Add processing in `interviewController.js`

## Troubleshooting

### Common Issues

1. **No Microphone Button**

   - Check browser support (Chrome, Firefox, Safari, Edge)
   - Ensure HTTPS connection
   - Verify MediaRecorder API availability

2. **Recording Not Starting**

   - Check microphone permissions
   - Verify microphone is not used by other apps
   - Try refreshing the page

3. **Poor Transcription Quality**

   - Speak clearly and slowly
   - Ensure good microphone quality
   - Reduce background noise
   - Check internet connection

4. **Processing Errors**
   - Verify backend service is running
   - Check authentication status
   - Monitor network connectivity

### Debug Information

Enable debug logging:

```javascript
// In browser console
localStorage.setItem("debug", "voice:*");
```

## Implementation Notes

- **Non-blocking**: Voice recording doesn't interfere with typing
- **Responsive**: Works on both desktop and mobile devices
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Progressive**: Gracefully degrades when not supported

This implementation provides a seamless voice-to-text experience that enhances the mock interview functionality while maintaining performance, security, and accessibility standards.
