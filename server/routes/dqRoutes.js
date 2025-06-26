const express = require("express");
const {
  getDQ,
  getQuestionsBySubject,
  submitQuizAnswers,
  testAnswerFormats,
  testDatabase,
} = require("../controllers/dqController");

const router = express.Router();

router.get("/daily-questions", getDQ);
router.get("/subject/:subject", getQuestionsBySubject);
router.post("/submit-answers", submitQuizAnswers);
router.get("/test-answer-formats", testAnswerFormats);
router.get("/test-database", testDatabase);

module.exports = router;
