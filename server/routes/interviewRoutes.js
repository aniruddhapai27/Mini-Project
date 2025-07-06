const express = require("express");
const multer = require("multer");
const {
  getInterviewSession,
  getUserInterviewHistory,
  deleteInterviewSession,
  updateInterviewFeedback,
  getInterviewFeedback,
  getInterviewStats,
  getInterviewConversation,
  endInterviewSession,
  getRecentInterviews,
  createResumeBasedInterview,
  continueResumeBasedInterview,
  continueInterviewSession,
  textToSpeech,
  voiceToText,
} = require("../controllers/interviewController");
const { isLogin } = require("../middlewares/isLogin");

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"), false);
    }
  },
});

const router = express.Router();

// Protect all routes - user must be logged in
router.use(isLogin);

// Voice-to-text route
router.post("/voice-to-text", upload.single("audio"), voiceToText);

// Text-to-speech route
router.post("/text-to-speech", textToSpeech);

// Interview session routes - Resume-based interviews use stored user resume
router.post("/sessions", createResumeBasedInterview);
router.get("/sessions/:sessionId", getInterviewSession);
router.get("/sessions/:sessionId/conversation", getInterviewConversation);
router.patch("/sessions/:sessionId", continueInterviewSession);
router.patch("/sessions/:sessionId/end", endInterviewSession);
router.delete("/sessions/:sessionId", deleteInterviewSession);

// Interview feedback routes
router.get("/sessions/:sessionId/feedback", getInterviewFeedback);
router.patch("/sessions/:sessionId/feedback", updateInterviewFeedback);

// Interview history routes
router.get("/history", getUserInterviewHistory);
router.get("/recent", getRecentInterviews);

// Interview statistics
router.get("/stats", getInterviewStats);

// Legacy routes (for backward compatibility)
router.post("/resume-based", createResumeBasedInterview);
router.patch("/resume-based/:sessionId", continueResumeBasedInterview);

module.exports = router;
