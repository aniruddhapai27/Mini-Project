const express = require('express');
const multer = require('multer');
const assistantController = require('../controllers/assistantController');
const { isLogin } = require('../middlewares/isLogin');

const router = express.Router();

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

// Protect all routes
router.use(isLogin);

// Assistant routes
router.post('/chat', assistantController.chatWithAssistant);
router.post('/resume', upload.single('file'), assistantController.analyzeResume);
router.get('/history', assistantController.getSessionHistory);
router.get('/session/:sessionId', assistantController.getSessionMessages);
router.delete('/session/:sessionId', assistantController.deleteSession);

module.exports = router;
