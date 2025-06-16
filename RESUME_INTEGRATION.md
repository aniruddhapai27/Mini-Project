# Resume-Based Interview Integration

This document outlines the secure resume integration with the mock interview feature.

## Overview

The system now supports secure, user-centric resume-based interviews where:
- Users upload their resume once to their profile
- The resume is stored securely in Cloudinary
- All future interviews use the stored resume automatically
- No need to upload resume for each interview session

## Architecture

### Backend Changes

#### User Model Updates
- Added `resume` field to store Cloudinary URL
- Resume is optional but recommended for personalized interviews

#### Interview Model Updates  
- Added `resumeUsed` field to track which resume was used for the interview
- Maintains audit trail of interview sessions

#### New User Controller Functions
- `uploadResume`: Handles secure resume upload to Cloudinary
- `getResume`: Retrieves user's current resume URL
- `deleteResume`: Removes resume from both Cloudinary and database

#### Updated Interview Controller
- `createResumeBasedInterview`: Now fetches user's stored resume automatically
- Downloads resume from Cloudinary and passes to Python service
- Fallback mechanism if resume download fails
- No longer requires file upload per interview

#### New User Routes
- `POST /api/user/resume` - Upload resume
- `GET /api/user/resume` - Get current resume
- `DELETE /api/user/resume` - Delete resume

#### Updated Interview Routes
- Removed multer file upload requirement from interview endpoints
- `POST /api/interview/sessions` - Create resume-based interview (uses stored resume)
- `PATCH /api/interview/sessions/:id` - Continue interview

### Python Service Updates

#### Authentication
- Updated to use proper JWT authentication from Node.js server
- Validates user tokens and extracts user information

#### Resume Processing
- Enhanced to handle URLs and various file formats
- Added text extraction from PDF, DOCX, and TXT files
- Improved error handling and fallback mechanisms

### Frontend Changes

#### New Components
- `ResumeManager.jsx`: Complete resume management interface
  - Upload, view, replace, and delete resume
  - Progress indicators and validation
  - Integration with Redux store

#### Updated Pages
- `MockInterviewSelection.jsx`: Shows resume status and encourages upload
- `MockInterview.jsx`: Simplified to not require file uploads
- `Profile.jsx`: Can integrate ResumeManager component

#### Redux Updates  
- Added `updateUser` action to auth slice
- Updated interview slice to work with new API structure
- Removed file upload parameters from interview actions

#### API Utilities
- Added `resumeApi` functions for resume management
- Added `interviewApi` functions for interview operations
- Centralized API calls with proper error handling

## Security Features

### Authentication
- All resume operations require user authentication
- JWT tokens validated on both Node.js and Python services
- User-specific resume access (users can only access their own resumes)

### File Security
- File type validation (PDF, DOCX, TXT only)
- File size limits (5MB maximum)
- Secure Cloudinary storage with unique file names
- Proper cleanup when resumes are deleted

### Data Privacy
- Resume content is processed server-side only
- No client-side storage of sensitive resume data
- Audit trail of which resume was used for each interview

## Usage Flow

### First Time Setup
1. User registers/logs in
2. User goes to Profile page
3. User uploads resume using ResumeManager component
4. Resume is stored in Cloudinary and URL saved to user profile

### Interview Process
1. User selects interview domain and difficulty
2. System shows resume status (uploaded/not uploaded)
3. User starts interview
4. Backend automatically fetches user's stored resume
5. Resume is sent to Python service for personalized questions
6. Interview proceeds with resume-based questions

### Resume Management
1. Users can view their current resume
2. Users can replace resume with new version
3. Users can delete resume (with confirmation)
4. All changes immediately affect future interviews

## Error Handling

### Resume Download Failures
- If Cloudinary is unavailable, system falls back to generic interview
- User is notified but interview continues
- Error logged for debugging

### Python Service Unavailability
- Fallback to predefined domain-specific questions
- Interview continues seamlessly
- Background error logging

### File Upload Errors
- Comprehensive validation messages
- Progress indicators show upload status
- Rollback mechanism if upload fails

## Benefits

### For Users
- Upload resume once, use for all interviews
- Personalized interview questions based on experience
- Better interview preparation and practice
- Secure and private resume storage

### For System
- Reduced bandwidth (no repeated uploads)
- Better user experience and retention
- Centralized resume management
- Improved interview quality and relevance

### For Security
- User-centric access control
- Secure file storage and transmission
- Audit trail and logging
- Data privacy compliance

## Configuration

### Environment Variables
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `JWT_SECRET`: JWT secret for authentication

### Dependencies
- Backend: `multer`, `cloudinary`, `axios`
- Python: `requests`, `pyjwt`, `pypdf2`, `python-docx`
- Frontend: Updated Redux store and API utilities

## Future Enhancements

### Planned Features
- Resume analysis and scoring
- Multiple resume support per user
- Resume templates and suggestions
- Integration with job posting APIs
- Advanced resume parsing (skills extraction, etc.)

### Technical Improvements
- Resume content caching for faster interviews
- Advanced file format support
- Resume version history
- Bulk resume operations for organizations
