const express = require("express");
const {
  getDQ,
  getQuestionsBySubject,
  submitQuizAnswers,
} = require("../controllers/dqController");

const router = express.Router();

router.get("/daily-questions", getDQ);
router.get("/subject/:subject", getQuestionsBySubject);
router.post("/submit-answers", submitQuizAnswers);

module.exports = router;
