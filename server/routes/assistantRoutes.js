const express = require('express');
const assistantController = require('../controllers/assistantController');
const { isLogin } = require('../middlewares/isLogin');

const router = express.Router();

// Protect all routes
router.use(isLogin);

// Assistant routes
router.post('/chat', assistantController.chatWithAssistant);
router.get('/history', assistantController.getSessionHistory);
router.get('/session/:sessionId', assistantController.getSessionMessages);

module.exports = router;
