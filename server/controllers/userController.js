const User = require("../models/userModel");
const QuizHistory = require("../models/quizHistoryModel");
const Interview = require("../models/interviewModel");
const { catchAsync } = require("../utils/catchAsync");
const cloudinary = require("../config/cloudinaryConfig");

// Get comprehensive streak statistics
exports.getStreakStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get all quiz activity dates for this user, sorted by date
    const quizDates = await QuizHistory.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          date: { $first: "$date" },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $project: {
          dateString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
        },
      },
    ]);

    const activeDates = quizDates.map((item) => item.dateString);
    const streakResults = calculateStreaks(activeDates);

    // Get recent interview sessions (last 4)
    const recentInterviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("domain difficulty score createdAt feedBack")
      .lean();

    // Update user's streak data in database
    await User.findByIdAndUpdate(req.user._id, {
      currentStreak: streakResults.currentStreak,
      maxStreak: Math.max(user.maxStreak || 0, streakResults.maxStreak),
      lastActivity: streakResults.lastActivity,
    });

    res.status(200).json({
      success: true,
      data: {
        currentStreak: streakResults.currentStreak,
        maxStreak: Math.max(user.maxStreak || 0, streakResults.maxStreak),
        totalActiveDays: activeDates.length,
        lastActivity: streakResults.lastActivity,
        recentInterviews: recentInterviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Helper function to calculate current and max streaks from activity dates
function calculateStreaks(activeDates) {
  if (!activeDates || activeDates.length === 0) {
    return {
      currentStreak: 0,
      maxStreak: 0,
      lastActivity: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Convert date strings to Date objects and sort
  const dates = activeDates
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a - b);

  let maxStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  // Calculate max streak by finding longest consecutive sequence
  for (let i = 0; i < dates.length; i++) {
    if (i > 0) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor(
        (currDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Gap found, reset temp streak
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  maxStreak = Math.max(maxStreak, tempStreak); // Don't forget the last streak

  // Calculate current streak (consecutive days up to today)
  const lastActivityDate = dates[dates.length - 1];
  const lastActivityStr = lastActivityDate.toISOString().split("T")[0];

  // Check if user was active today or yesterday (streak continues)
  const daysSinceLastActivity = Math.floor(
    (today - lastActivityDate) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity <= 1) {
    // Count backwards from last activity to find current streak
    currentStreak = 1;

    for (let i = dates.length - 2; i >= 0; i--) {
      const currDate = new Date(dates[i]);
      const nextDate = new Date(dates[i + 1]);
      const diffDays = Math.floor(
        (nextDate - currDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }
  } else {
    // More than 1 day gap, current streak is 0
    currentStreak = 0;
  }

  return {
    currentStreak,
    maxStreak,
    lastActivity: lastActivityDate,
  };
}

exports.updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0); // Set to start of day
      const diffDays = Math.floor(
        (today - lastActivity) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Same day, don't update streak count but update lastActivity time
        user.lastActivity = new Date(); // Use actual current time
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        user.currentStreak += 1;
        user.lastActivity = new Date();
      } else if (diffDays > 1) {
        // Gap in days, reset streak to 1
        user.currentStreak = 1;
        user.lastActivity = new Date();
      }
    } else {
      // First time activity
      user.currentStreak = 1;
      user.lastActivity = new Date();
    }

    // Update max streak if current streak is higher
    user.maxStreak = Math.max(user.maxStreak || 0, user.currentStreak);
    await user.save();

    res.status(200).json({
      success: true,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastActivity: user.lastActivity,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Upload or update user's resume
exports.uploadResume = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file provided",
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            public_id: `mini-project/resumes/resume-${Date.now()}`,
            format: req.file.originalname.split(".").pop(),
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    // Update user with resume URL
    const user = await User.findByIdAndUpdate(
      userId,
      { resume: result.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        user: user,
        resumeUrl: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message,
    });
  }
});

// Get user's current resume
exports.getResume = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("resume");

    if (!user || !user.resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        resumeUrl: user.resume,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get resume",
      error: error.message,
    });
  }
});

// Delete user's resume
exports.deleteResume = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found for this user",
      });
    }

    // Extract public_id from Cloudinary URL to delete the file
    const publicId = user.resume.split("/").slice(-2).join("/").split(".")[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Update user to remove resume URL
    await User.findByIdAndUpdate(userId, { resume: null });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Resume deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
});
