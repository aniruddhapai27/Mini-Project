# InterviewAI 🚀

> **Master your interview skills with AI-powered practice sessions**

InterviewAI is a comprehensive web application that helps engineering students and professionals prepare for technical interviews using advanced AI technology. The platform provides personalized interview practice, daily quiz challenges, study assistance, and resume analysis.

🌐 **Live Demo**: [https://my-project.tech](https://my-project.tech)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Objective

The primary objective of InterviewAI is to bridge the gap between academic knowledge and interview readiness for engineering students. By leveraging AI technology, the platform provides:

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

### Frontend
- **React 19.1.0** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

### Backend (Node.js Server)
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Cloudinary** - Cloud-based image and file storage
- **Bcrypt** - Password hashing
- **Nodemailer** - Email functionality
- **Multer** - File upload handling

### AI/ML Services (Python)
- **FastAPI** - Modern Python web framework
- **Groq API** - LLM inference with Llama-4-Scout
- **Whisper API** - Speech-to-text transcription
- **Motor** - Async MongoDB driver for Python
- **PyPDF2** - PDF text extraction
- **Python-DOCX** - Word document processing

## 📁 Project Structure

```
Mini-Project/
│
├── 📱 client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── AuthLayout.jsx         # Authentication wrapper
│   │   │   ├── Navbar.jsx             # Navigation component
│   │   │   ├── ProtectedRoute.jsx     # Route protection
│   │   │   └── Loading.jsx            # Loading states
│   │   ├── pages/                     # Main application pages
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Dashboard.jsx          # User dashboard
│   │   │   ├── Profile.jsx            # User profile management
│   │   │   ├── Login.jsx              # Authentication
│   │   │   ├── Register.jsx           # User registration
│   │   │   ├── Quiz.jsx               # Quiz interface
│   │   │   ├── QuizSelection.jsx      # Subject selection
│   │   │   └── QuizResults.jsx        # Results display
│   │   ├── redux/                     # State management
│   │   │   ├── store.js               # Redux store configuration
│   │   │   └── slices/                # Redux slices
│   │   └── utils/                     # Utility functions
│   │       ├── api.js                 # API configuration
│   │       └── dqApi.js               # Daily questions API
│   ├── package.json
│   └── vite.config.js
│
├── 🖥️ server/                          # Node.js Backend Server
│   ├── controllers/                   # Business logic
│   │   ├── authController.js          # Authentication logic
│   │   ├── userController.js          # User management
│   │   └── dqController.js            # Daily questions
│   ├── models/                        # Database schemas
│   │   ├── userModel.js               # User schema
│   │   ├── dqModel.js                 # Daily questions schema
│   │   ├── interviewModel.js          # Interview sessions
│   │   ├── assistantModel.js          # Study assistant sessions
│   │   └── resumeModel.js             # Resume analysis
│   ├── routes/                        # API routes
│   │   ├── authRoutes.js              # Authentication endpoints
│   │   ├── userRoutes.js              # User endpoints
│   │   └── dqRoutes.js                # Daily questions endpoints
│   ├── middlewares/                   # Custom middleware
│   │   └── isLogin.js                 # Authentication middleware
│   ├── config/                        # Configuration files
│   │   ├── cloudinaryConfig.js        # File storage config
│   │   └── cloudinaryStorage.js       # Storage settings
│   ├── utils/                         # Utility functions
│   │   └── email.js                   # Email services
│   └── server.js                      # Server entry point
│
├── 🐍 services/                        # Python AI/ML Services
│   ├── controllers/                   # AI service controllers
│   │   ├── assistant_controller.py    # Study assistant logic
│   │   └── interview_controller.py    # Interview AI logic
│   ├── models/                        # Data models and prompts
│   │   ├── database_models.py         # Pydantic models
│   │   ├── request_models.py          # API request models
│   │   ├── response_model.py          # API response models
│   │   └── prompts.py                 # AI prompts and templates
│   ├── routes/                        # FastAPI routes
│   │   ├── assistant_routes.py        # Study assistant endpoints
│   │   └── interview_routes.py        # Interview endpoints
│   ├── database/                      # Database configuration
│   │   └── db_config.py               # MongoDB connection
│   ├── utils/                         # Utility functions
│   │   ├── helper.py                  # Text processing utilities
│   │   └── auth_middleware.py         # Authentication helpers
│   ├── api.py                         # FastAPI main application
│   ├── auth.py                        # Authentication logic
│   └── requirements.txt               # Python dependencies
│
└── 📖 README.md                        # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/InterviewAI.git
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
source minenv/bin/activate  # On Windows: minenv\Scripts\activate
pip install -r requirements.txt
```

### Environment Configuration

Create `.env` files in each directory:

#### Server/.env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/interviewai
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### Services/.env
```env
GROQ_API_KEY_DQ=your_groq_api_key
GROQ_API_AUDIO=your_groq_audio_key
MONGODB_URI=mongodb://localhost:27017/interviewai
```

#### Client/.env
```env
VITE_APP_BACKEND_URL=http://localhost:5000
VITE_APP_SERVICES_URL=http://localhost:8000
```

### Running the Application

1. **Start MongoDB** (if running locally)

2. **Start the Backend Server**
```bash
cd server
npm run dev
```

3. **Start the AI Services**
```bash
cd services
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

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password/:token` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Daily Questions Endpoints
- `GET /api/v1/dq/daily-questions` - Get all daily questions
- `GET /api/v1/dq/subject/:subject` - Get questions by subject
- `POST /api/v1/dq/submit-answers` - Submit quiz answers

### AI Services Endpoints (FastAPI)
- `POST /services/api/v1/interview/transcript` - Voice to text
- `POST /services/api/v1/interview/get-interview` - AI interview
- `POST /services/api/v1/interview/feedback` - Interview feedback
- `POST /services/api/v1/assistant/chat` - Study assistant
- `POST /services/api/v1/assistant/resume` - Resume analysis
- `POST /services/api/v1/assistant/daily-questions` - Generate questions

## 🎨 Features in Detail

### Interview Practice
- **Voice Recognition**: Real-time speech-to-text using Whisper
- **Dynamic Questions**: AI generates contextual follow-up questions
- **Comprehensive Feedback**: Technical knowledge, communication, confidence scoring
- **Multiple Domains**: Technical coding, behavioral, system design interviews

### Daily Quiz System
- **6 Core Subjects**: Comprehensive coverage of engineering fundamentals
- **Adaptive Difficulty**: Questions scale with user performance
- **Progress Tracking**: Streak counters and performance analytics
- **Instant Feedback**: Immediate results with explanation

### Study Assistant
- **Textbook-Based**: Answers based on standard engineering textbooks
- **Conversational AI**: Natural language interaction with context awareness
- **Subject Experts**: Specialized knowledge for each engineering domain

### Resume Analysis
- **Grammar Check**: AI-powered error detection and correction
- **ATS Optimization**: Compatibility scoring for applicant tracking systems
- **Personalized Suggestions**: Tailored recommendations for improvement