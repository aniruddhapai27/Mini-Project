const express = require('express');
const multer = require('multer');
const {
  getInterviewSession,
  getUserInterviewHistory,
  deleteInterviewSession,
  updateInterviewFeedback,
  getInterviewStats,
  getInterviewConversation,
  endInterviewSession,
  getRecentInterviews,
  createResumeBasedInterview,
  continueResumeBasedInterview
} = require('../controllers/interviewController');
const { isLogin } = require('../middlewares/isLogin');

const router = express.Router();

// Configure multer for resume upload
const memoryStorage = multer.memoryStorage();
const resumeUpload = multer({ 
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all routes - user must be logged in
router.use(isLogin);

// Interview session routes - All interviews now require resume upload
router.post('/sessions', resumeUpload.single('resume'), createResumeBasedInterview);
router.get('/sessions/:sessionId', getInterviewSession);
router.get('/sessions/:sessionId/conversation', getInterviewConversation);
router.patch('/sessions/:sessionId', continueResumeBasedInterview);
router.patch('/sessions/:sessionId/end', endInterviewSession);
router.delete('/sessions/:sessionId', deleteInterviewSession);

// Interview feedback routes
router.patch('/sessions/:sessionId/feedback', updateInterviewFeedback);

// Interview history routes
router.get('/history', getUserInterviewHistory);
router.get('/recent', getRecentInterviews);

// Interview statistics
router.get('/stats', getInterviewStats);

router.post('/resume-based', resumeUpload.single('resume'), createResumeBasedInterview);
router.patch('/resume-based/:sessionId', continueResumeBasedInterview);

module.exports = router;
