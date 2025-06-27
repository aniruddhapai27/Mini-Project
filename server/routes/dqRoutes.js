const express = require("express");
const {
  getDQ,
  getQuestionsBySubject,
  submitQuizAnswers,
  testAnswerFormats,
  testDatabase,
  getUserQuizHistory,
  getQuizStats,
} = require("../controllers/dqController");
const { isLogin } = require("../middlewares/isLogin");

const router = express.Router();

router.get("/daily-questions", getDQ);
router.get("/subject/:subject", getQuestionsBySubject);
router.post("/submit-answers", isLogin, submitQuizAnswers);
router.get("/test-answer-formats", testAnswerFormats);
router.get("/test-database", testDatabase);

// Quiz history routes (protected)
router.get("/history", isLogin, getUserQuizHistory);
router.get("/stats", isLogin, getQuizStats);

module.exports = router;
