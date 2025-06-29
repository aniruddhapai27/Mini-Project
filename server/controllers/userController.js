const User = require("../models/userModel");
const { catchAsync } = require("../utils/catchAsync");
const cloudinary = require("../config/cloudinaryConfig");


exports.updateStreak = async(req, res) =>{
    try {
        const user = await User.findById(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
        
        if(lastActivity){
            lastActivity.setHours(0, 0, 0, 0); // Set to start of day
            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            
            if(diffDays === 0){
                // Same day, don't update streak count but update lastActivity time
                user.lastActivity = new Date(); // Use actual current time
            } else if(diffDays === 1){
                // Consecutive day, increment streak
                user.currentStreak += 1;
                user.lastActivity = new Date();
            } else if(diffDays > 1){
                // Gap in days, reset streak to 1
                user.currentStreak = 1;
                user.lastActivity = new Date();
            }
        } else {
            // First time activity
            user.currentStreak = 1;
            user.lastActivity = new Date();
        }

        user.maxStreak = Math.max(user.maxStreak, user.currentStreak);
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
        })
    }
};

// Upload or update user's resume
exports.uploadResume = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file provided"
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: `mini-project/resumes/resume-${Date.now()}`,
          format: req.file.originalname.split('.').pop(),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user with resume URL
    const user = await User.findByIdAndUpdate(
      userId,
      { resume: result.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        user: user,
        resumeUrl: result.secure_url
      }
    });

  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message
    });
  }
});

// Get user's current resume
exports.getResume = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('resume');
    
    if (!user || !user.resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found for this user"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        resumeUrl: user.resume
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get resume",
      error: error.message
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
        message: "No resume found for this user"
      });
    }

    // Extract public_id from Cloudinary URL to delete the file
    const publicId = user.resume.split('/').slice(-2).join('/').split('.')[0];
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Update user to remove resume URL
    await User.findByIdAndUpdate(userId, { resume: null });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (error) {
    console.error("Resume deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message
    });
  }
});