# SkillWise-AI 🚀

> **Master your interview skills with AI-powered practice sessions**

SkillWise-AI is a comprehensive web application that helps engineering students and professionals prepare for technical interviews using advanced AI technology. The platform provides personalized interview practice, daily quiz challenges, study assistance, and resume analysis with ATS optimization.

🌐 **Live Demo**: [https://my-project.tech](https://my-project.tech)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Objective

The primary objective of SkillWise-AI is to bridge the gap between academic knowledge and interview readiness for engineering students. By leveraging AI technology, the platform provides:

- **Personalized Interview Practice**: AI-powered mock interviews tailored to specific domains and difficulty levels
- **Skill Assessment**: Comprehensive evaluation and feedback on technical and soft skills
- **Knowledge Reinforcement**: Daily quiz challenges covering core engineering subjects
- **Resume Optimization**: AI-driven resume analysis with ATS compatibility scoring
- **Study Assistance**: Subject-specific AI tutoring based on standard textbooks

## ✨ Key Features

### 🎤 AI-Powered Mock Interviews
- Real-time voice-to-text transcription using Whisper API
- Dynamic question generation based on domain (Technical, Behavioral, System Design)
- Difficulty levels: Beginner, Intermediate, Advanced
- Comprehensive feedback with scoring (0-100)
- Session history and progress tracking

### 📚 Daily Quiz Challenges
- Auto-generated questions for 6 core engineering subjects:
  - Data Structures & Algorithms
  - Operating Systems
  - Computer Networks
  - Database Management Systems
  - Software Engineering
  - Algorithm Design & Analysis
- Multiple choice questions with instant feedback
- Performance analytics and streak tracking

### 🤖 AI Study Assistant
- Subject-specific tutoring using standard textbooks
- Conversational AI based on Llama-4-Scout model
- Context-aware responses with chat history
- Supports ADA, CN, DBMS, OS, SE, and DS subjects

### 📄 Resume Analysis
- AI-powered grammatical error detection
- ATS (Applicant Tracking System) compatibility scoring
- Personalized improvement suggestions
- Support for PDF, DOCX, and TXT formats

### 👤 User Management
- Secure authentication with JWT tokens
- Profile management with photo and resume upload
- Password reset functionality via email
- Session tracking and performance analytics

## 🛠 Tech Stack

### Frontend (React 19.1.0)
- **React 19.1.0** - Latest React with concurrent features and modern hooks
- **Vite 6.3.5** - Ultra-fast build tool and development server
- **Tailwind CSS 4.1.5** - Utility-first CSS framework with custom configuration
- **Redux Toolkit 2.8.2** - Modern Redux state management
- **React Router DOM 7.6.1** - Declarative routing for React applications
- **Framer Motion 12.19.1** - Production-ready motion library for React
- **Axios 1.9.0** - Promise-based HTTP client
- **React Hot Toast 2.5.2** - Beautiful toast notifications
- **React Icons 5.5.0** - Popular icon library
- **React Markdown 10.1.0** - Markdown component for React
- **Recharts 3.0.2** - Composable charting library
- **@lottiefiles/dotlottie-react 0.14.2** - Lottie animations for React

### Backend (Node.js/Express)
- **Express.js 5.1.0** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose 8.14.1 ODM
- **JWT** - JSON Web Token authentication with jsonwebtoken 9.0.2
- **Cloudinary 1.41.3** - Cloud-based image and file storage
- **Bcrypt.js 3.0.2** - Password hashing library
- **Nodemailer 7.0.3** - Email sending functionality
- **Multer 2.0.1** - Middleware for handling multipart/form-data
- **Morgan 1.10.0** - HTTP request logger middleware
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **Cookie Parser 1.4.7** - Cookie parsing middleware
- **HTTP Proxy Middleware 3.0.5** - Proxy middleware for API routing

### AI/ML Services (Python/FastAPI)
- **FastAPI** - Modern Python web framework for building APIs
- **Groq API** - High-performance LLM inference for AI responses
- **Whisper API** - Speech-to-text transcription service
- **LangChain** - Framework for developing LLM applications
- **LangChain Groq** - Groq integration for LangChain
- **LangChain Community** - Community-driven LangChain components
- **LangChain HuggingFace** - HuggingFace integration
- **Motor 3.0.0** - Async MongoDB driver for Python
- **PyMongo 4.0.0** - MongoDB Python driver
- **Pydantic** - Data validation using Python type annotations
- **PyPDF2** - PDF text extraction library
- **Python-DOCX** - Word document processing
- **PyJWT** - JSON Web Token implementation
- **FAISS-CPU** - Facebook AI Similarity Search library
- **Uvicorn** - ASGI server implementation

## 📁 Project Structure

```
Mini-Project/
│
├── 📱 client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── AuthLayout.jsx         # Authentication wrapper layout
│   │   │   ├── Navbar.jsx             # Navigation component
│   │   │   ├── ProtectedRoute.jsx     # Route protection wrapper
│   │   │   ├── Loading.jsx            # Loading state components
│   │   │   ├── VoiceRecorder.jsx      # Voice recording component
│   │   │   ├── Gamification.jsx       # Gamification features
│   │   │   ├── StreakVisualizer.jsx   # Streak tracking visualization
│   │   │   ├── ErrorBoundary.jsx      # Error boundary component
│   │   │   ├── DotLottieLoader.jsx    # Lottie animation loader
│   │   │   ├── ResumeATS.jsx          # Resume ATS analysis
│   │   │   └── shared/                # Shared components
│   │   ├── pages/                     # Main application pages
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Dashboard.jsx          # User dashboard
│   │   │   ├── Profile.jsx            # User profile management
│   │   │   ├── Login.jsx              # User authentication
│   │   │   ├── Register.jsx           # User registration
│   │   │   ├── ForgotPassword.jsx     # Password reset request
│   │   │   ├── ResetPassword.jsx      # Password reset form
│   │   │   ├── Quiz.jsx               # Quiz interface
│   │   │   ├── QuizSelection.jsx      # Subject selection for quiz
│   │   │   ├── QuizResults.jsx        # Quiz results display
│   │   │   ├── MockInterview.jsx      # Mock interview interface
│   │   │   ├── MockInterviewSelection.jsx # Interview type selection
│   │   │   ├── MockInterviewResults.jsx   # Interview results
│   │   │   ├── InterviewHistory.jsx   # Interview session history
│   │   │   ├── StudyAssistant.jsx     # AI study assistant
│   │   │   └── ResumeATSPage.jsx      # Resume analysis page
│   │   ├── redux/                     # State management
│   │   │   ├── store.js               # Redux store configuration
│   │   │   └── slices/                # Redux slices for different features
│   │   ├── utils/                     # Utility functions
│   │   │   ├── api.js                 # API configuration and utilities
│   │   │   └── dqApi.js               # Daily questions API
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── contexts/                  # React context providers
│   │   └── assets/                    # Static assets and images
│   ├── public/                        # Public static files
│   │   ├── ada.jpg                    # Subject images
│   │   ├── cn.jpg
│   │   ├── dbms.jpg
│   │   ├── ds.jpg
│   │   ├── os.jpg
│   │   └── se.jpg
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── eslint.config.js               # ESLint configuration
│   └── vercel.json                    # Vercel deployment config
│
├── 🖥️ server/                          # Node.js Backend Server
│   ├── controllers/                   # Business logic controllers
│   │   ├── authController.js          # Authentication logic
│   │   ├── userController.js          # User management
│   │   ├── dqController.js            # Daily questions management
│   │   ├── interviewController.js     # Interview session management
│   │   └── assistantController.js     # Study assistant proxy
│   ├── models/                        # Database schemas (Mongoose)
│   │   ├── userModel.js               # User data schema
│   │   ├── dqModel.js                 # Daily questions schema
│   │   ├── interviewModel.js          # Interview session schema
│   │   ├── assistantModel.js          # Study assistant session schema
│   │   ├── resumeModel.js             # Resume analysis schema
│   │   └── quizHistoryModel.js        # Quiz performance history
│   ├── routes/                        # API route definitions
│   │   ├── authRoutes.js              # Authentication endpoints
│   │   ├── userRoutes.js              # User management endpoints
│   │   ├── dqRoutes.js                # Daily questions endpoints
│   │   ├── interviewRoutes.js         # Interview endpoints
│   │   └── assistantRoutes.js         # Study assistant endpoints
│   ├── middlewares/                   # Custom middleware
│   │   └── isLogin.js                 # JWT authentication middleware
│   ├── config/                        # Configuration files
│   │   ├── cloudinaryConfig.js        # Cloudinary setup
│   │   └── cloudinaryStorage.js       # File storage configuration
│   ├── utils/                         # Utility functions
│   │   ├── email.js                   # Email service utilities
│   │   ├── catchAsync.js              # Async error handling
│   │   └── pythonAPI.js               # Python service integration
│   ├── jwt/                           # JWT utilities
│   │   └── jsonWebToken.js            # Token generation and validation
│   ├── package.json                   # Backend dependencies
│   └── server.js                      # Express server entry point
│
├── 🐍 services/                        # Python AI/ML Services
│   ├── controllers/                   # AI service controllers
│   │   ├── assistant_controller.py    # Study assistant AI logic
│   │   └── interview_controller.py    # Interview AI logic and feedback
│   ├── models/                        # Data models and AI prompts
│   │   ├── database_models.py         # Pydantic models for database
│   │   ├── request_models.py          # API request validation models
│   │   ├── response_model.py          # API response models
│   │   └── prompts.py                 # AI prompts and templates
│   ├── routes/                        # FastAPI route definitions
│   │   ├── assistant_routes.py        # Study assistant API endpoints
│   │   └── interview_routes.py        # Interview AI API endpoints
│   ├── database/                      # Database configuration
│   │   └── db_config.py               # MongoDB async connection
│   ├── utils/                         # Utility functions
│   │   ├── helper.py                  # Text processing utilities
│   │   └── auth_middleware.py         # JWT authentication for FastAPI
│   ├── speech_output/                 # Generated speech files
│   ├── minenv/                        # Python virtual environment
│   ├── api.py                         # FastAPI main application
│   ├── auth.py                        # Authentication logic
│   ├── requirements.txt               # Python dependencies
│   └── test_auth.py                   # Authentication testing
│
├── � Documentation Files
│   ├── README.md                      # Main project documentation
│   ├── ASSISTANT_PAGINATION_IMPLEMENTATION.md
│   ├── DOTLOTTIE_LOADER_FIX.md
│   ├── INTERVIEW_FEEDBACK_DISPLAY_ENHANCEMENT.md
│   ├── TEXT_TO_SPEECH_INTEGRATION.md
│   ├── VOICE_TO_TEXT_INTEGRATION.md
│   └── AUTHENTICATION_GUIDE.md
│
└── 🔧 Configuration Files
    ├── package.json                   # Root package.json for workspace
    └── debug.txt                      # Debug information
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/SkillWise-AI.git
cd Mini-Project
```

2. **Setup Backend Server (Node.js)**
```bash
cd server
npm install
```

3. **Setup Frontend Client (React)**
```bash
cd ../client
npm install
```

4. **Setup AI Services (Python)**
```bash
cd ../services
python -m venv minenv
# On Windows
minenv\Scripts\activate
# On macOS/Linux
source minenv/bin/activate
pip install -r requirements.txt
```

### Environment Configuration

Create `.env` files in each directory:

#### Server/.env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/SkillWise-AI
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

#### Services/.env
```env
GROQ_API_KEY_DQ=your_groq_api_key_for_daily_questions
GROQ_API_AUDIO=your_groq_audio_api_key
MONGODB_URI=mongodb://localhost:27017/SkillWise-AI
```

#### Client/.env
```env
VITE_APP_BACKEND_URL=http://localhost:5000
VITE_APP_SERVICES_URL=http://localhost:8000
```

### Running the Application

You can use VS Code tasks or run manually:

#### Using VS Code Tasks (Recommended)
1. Open VS Code in the project root
2. Use Ctrl+Shift+P (Cmd+Shift+P on macOS) and type "Tasks: Run Task"
3. Select one of the available tasks:
   - **Start Client Development Server** - Runs the React frontend
   - **Start Server Development Server** - Runs the Node.js backend
   - **Start Python API Service** - Runs the FastAPI Python services

#### Manual Startup
1. **Start MongoDB** (if running locally)

2. **Start the Backend Server**
```bash
cd server
npm run dev
```

3. **Start the AI Services**
```bash
cd services
# Activate virtual environment first
python api.py
```

4. **Start the Frontend Client**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Services**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔄 Development Workflow

### Development Scripts

#### Frontend (client/)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Backend (server/)
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

#### AI Services (services/)
```bash
python api.py    # Start FastAPI server
uvicorn api:api --reload --host 0.0.0.0 --port 8000  # Start with auto-reload
```

### Architecture Overview

The application follows a **microservices architecture**:

1. **Frontend (React)**: Handles user interface and client-side state management
2. **Backend (Node.js/Express)**: Manages user authentication, database operations, and file uploads
3. **AI Services (Python/FastAPI)**: Provides AI-powered features like interview feedback, study assistance, and resume analysis

### Key Development Features

- **Hot Reload**: All services support hot reload during development
- **Error Boundaries**: React error boundaries catch and handle client-side errors gracefully
- **Async Operations**: Comprehensive async/await patterns with proper error handling
- **Type Safety**: Pydantic models ensure type safety in Python services
- **Authentication**: JWT-based authentication across all services
- **File Upload**: Cloudinary integration for file storage and management

## 📚 API Documentation

### Authentication Endpoints (Node.js Backend)
```
Base URL: http://localhost:5000/api/v1/auth
```

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | User registration | ❌ |
| `POST` | `/login` | User login | ❌ |
| `GET` | `/logout` | User logout | ❌ |
| `POST` | `/forgot-password` | Password reset request | ❌ |
| `POST` | `/reset-password/:token` | Reset password with token | ❌ |
| `PATCH` | `/update-password` | Update current password | ✅ |
| `PATCH` | `/update-profile` | Update user profile | ✅ |
| `GET` | `/me` | Get current user details | ✅ |

### User Management Endpoints
```
Base URL: http://localhost:5000/api/v1/users
```

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/profile` | Get user profile | ✅ |
| `PATCH` | `/profile` | Update user profile | ✅ |
| `POST` | `/upload-avatar` | Upload profile picture | ✅ |
| `POST` | `/upload-resume` | Upload resume file | ✅ |

### Daily Questions Endpoints
```
Base URL: http://localhost:5000/api/v1/dq
```

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/daily-questions` | Get all daily questions | ✅ |
| `GET` | `/subject/:subject` | Get questions by subject | ✅ |
| `POST` | `/submit-answers` | Submit quiz answers | ✅ |
| `GET` | `/history` | Get quiz history | ✅ |
| `GET` | `/streak` | Get current streak | ✅ |

### Interview Endpoints
```
Base URL: http://localhost:5000/api/v1/interview
```

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/create-session` | Create interview session | ✅ |
| `GET` | `/sessions` | Get user interview sessions | ✅ |
| `GET` | `/session/:id` | Get specific session | ✅ |
| `PATCH` | `/session/:id` | Update session | ✅ |
| `DELETE` | `/session/:id` | Delete session | ✅ |

### AI Services Endpoints (FastAPI Python)
```
Base URL: http://localhost:8000/services/api/v1
```

#### Interview AI Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/interview/transcript` | Convert voice to text | ✅ |
| `POST` | `/interview/get-interview` | Get AI interview questions | ✅ |
| `POST` | `/interview/feedback` | Generate interview feedback | ✅ |
| `POST` | `/interview/text-to-speech` | Convert text to speech | ✅ |
| `POST` | `/interview/resume-based-interview` | Resume-based interview | ✅ |

#### Study Assistant Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/assistant/chat` | Chat with study assistant | ✅ |
| `POST` | `/assistant/resume` | Analyze resume with ATS | ✅ |
| `POST` | `/assistant/daily-questions` | Generate daily questions | ✅ |
| `GET` | `/assistant/subjects` | Get available subjects | ✅ |

### Request/Response Examples

#### Authentication
```json
// POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### Voice Transcription
```json
// POST /services/api/v1/interview/transcript
// Form Data: file (audio file)

// Response
{
  "text": "Hello, my name is John and I am a software developer..."
}
```

#### Interview Feedback
```json
// POST /services/api/v1/interview/feedback
{
  "questions": ["Tell me about yourself"],
  "answers": ["I am a software developer..."],
  "domain": "technical",
  "difficulty": "intermediate"
}

// Response
{
  "overall_score": 85,
  "feedback": {
    "technical_knowledge": 90,
    "communication": 80,
    "confidence": 85
  },
  "detailed_feedback": "Your technical knowledge is excellent...",
  "suggestions": ["Practice explaining complex concepts more clearly"]
}
```

### Interactive API Documentation

- **FastAPI Swagger UI**: http://localhost:8000/docs
- **FastAPI ReDoc**: http://localhost:8000/redoc

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🎨 Features in Detail

### 🎤 AI-Powered Mock Interviews
- **Voice Recognition**: Real-time speech-to-text using Groq Whisper API
- **Dynamic Question Generation**: AI generates contextual follow-up questions based on responses
- **Multiple Interview Types**: Technical coding, behavioral, system design, and resume-based interviews
- **Difficulty Scaling**: Beginner, Intermediate, and Advanced difficulty levels
- **Comprehensive Feedback**: Detailed scoring on technical knowledge, communication skills, and confidence
- **Session History**: Track progress across multiple interview sessions
- **Resume-Based Questions**: AI analyzes uploaded resume to generate relevant questions

### 📚 Daily Quiz Challenges
- **6 Core Engineering Subjects**:
  - Data Structures & Algorithms (DS)
  - Operating Systems (OS)
  - Computer Networks (CN)
  - Database Management Systems (DBMS)
  - Software Engineering (SE)
  - Algorithm Design & Analysis (ADA)
- **Intelligent Question Generation**: AI-powered question creation based on curriculum
- **Performance Analytics**: Detailed tracking of performance trends and weak areas
- **Streak System**: Gamified daily practice with streak counters and achievements
- **Instant Feedback**: Immediate results with detailed explanations for each answer
- **Adaptive Difficulty**: Questions adapt based on user performance and learning curve

### 🤖 AI Study Assistant
- **Subject-Specific Expertise**: Specialized AI tutors for each engineering domain
- **Textbook Integration**: Responses based on standard engineering textbooks and curriculum
- **Conversational Interface**: Natural language interaction with context-aware responses
- **Chat History**: Persistent conversation history for continued learning
- **Multi-Modal Support**: Text-based queries with comprehensive explanations
- **Personalized Learning**: Adapts explanations based on user's knowledge level

### 📄 Resume Analysis & ATS Optimization
- **AI-Powered Grammar Check**: Advanced grammatical error detection and correction
- **ATS Compatibility Scoring**: Detailed analysis for Applicant Tracking System optimization
- **Format Analysis**: Support for PDF, DOCX, and TXT file formats
- **Personalized Suggestions**: Tailored recommendations for improvement
- **Industry Standards**: Analysis based on current hiring trends and requirements
- **Skills Gap Analysis**: Identification of missing keywords and skills

### 👤 Advanced User Management
- **Secure Authentication**: JWT-based authentication with refresh token support
- **Profile Customization**: Comprehensive profile management with photo upload
- **Password Security**: Bcrypt hashing with password reset functionality via email
- **Session Tracking**: Detailed analytics on user performance and progress
- **Cloud Storage**: Secure file storage using Cloudinary integration
- **Data Privacy**: GDPR-compliant user data handling and privacy controls

### 🎮 Gamification Features
- **Streak Tracking**: Visual streak counters with calendar integration
- **Performance Graphs**: Interactive charts showing progress over time
- **Achievement System**: Badges and milestones for consistent practice
- **Leaderboards**: Competitive elements to encourage regular engagement
- **Progress Visualization**: GitHub-style contribution graphs for quiz activities

## 🚀 Deployment

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with the included `vercel.json`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

### Backend Deployment Options

#### Option 1: Railway/Render
```bash
# Add to package.json in server/
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install"
  }
}
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Python Services Deployment

#### FastAPI with Docker
```dockerfile
# Dockerfile for services
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "api:api", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

Update your production environment variables:

```env
# Production URLs
VITE_APP_BACKEND_URL=https://your-backend-domain.com
VITE_APP_SERVICES_URL=https://your-python-services-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/SkillWise-AI

# Security
JWT_SECRET=your_super_secure_jwt_secret_for_production
```

### Monitoring and Analytics

- **Error Tracking**: Implement Sentry for production error monitoring
- **Performance**: Use React DevTools and browser performance monitoring
- **API Monitoring**: FastAPI built-in metrics and logging
- **Database Monitoring**: MongoDB Atlas monitoring for production

### Development Setup

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies** for all services (see Getting Started)
4. **Make your changes** following the coding standards
5. **Test thoroughly** across all services
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request** with a clear description

### Coding Standards

#### Frontend (React)
- Use functional components with hooks
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Write meaningful component names

#### Backend (Node.js)
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch
- Follow RESTful API conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### AI Services (Python)
- Follow PEP 8 style guidelines
- Use type hints with Pydantic models
- Implement proper async patterns
- Add docstrings for all functions
- Handle exceptions gracefully


### Third-Party Licenses

This project uses several open-source libraries and services:
- **React**: MIT License
- **FastAPI**: MIT License  
- **Express.js**: MIT License
- **Tailwind CSS**: MIT License
- **MongoDB**: Server Side Public License (SSPL)
- **Groq API**: Commercial API service
- **Cloudinary**: Commercial service with free tier

<div align="center">

</div>