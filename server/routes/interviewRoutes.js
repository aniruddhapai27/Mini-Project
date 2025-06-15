const express = require('express');
const {
  createInterviewSession,
  getInterviewSession,
  updateInterviewSession,
  getUserInterviewHistory,
  deleteInterviewSession,
  updateInterviewFeedback,
  getInterviewStats,
  getInterviewConversation,
  endInterviewSession,
  getRecentInterviews
} = require('../controllers/interviewController');
const { isLogin } = require('../middlewares/isLogin');

const router = express.Router();

// Protect all routes - user must be logged in
router.use(isLogin);

// Interview session routes
router.post('/sessions', createInterviewSession);
router.get('/sessions/:sessionId', getInterviewSession);
router.get('/sessions/:sessionId/conversation', getInterviewConversation);
router.patch('/sessions/:sessionId', updateInterviewSession);
router.patch('/sessions/:sessionId/end', endInterviewSession);
router.delete('/sessions/:sessionId', deleteInterviewSession);

// Interview feedback routes
router.patch('/sessions/:sessionId/feedback', updateInterviewFeedback);

// Interview history routes
router.get('/history', getUserInterviewHistory);
router.get('/recent', getRecentInterviews);

// Interview statistics
router.get('/stats', getInterviewStats);

module.exports = router;
