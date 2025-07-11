const express = require("express");
const multer = require("multer");

const {
  updateStreak,
  getStreakStats,
  uploadResume,
  getResume,
  deleteResume,
} = require("../controllers/userController");

const { isLogin } = require("../middlewares/isLogin");

const userRouter = express.Router();

// Configure multer for resume upload
const memoryStorage = multer.memoryStorage();
const resumeUpload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Protected routes
userRouter.use(isLogin);

userRouter.patch("/update-streak", updateStreak);
userRouter.get("/streak-stats", getStreakStats);

// Resume routes
userRouter.post("/resume", resumeUpload.single("resume"), uploadResume);
userRouter.get("/resume", getResume);
userRouter.delete("/resume", deleteResume);

module.exports = userRouter;
