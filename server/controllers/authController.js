const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const generateAuthToken = require("../jwt/jsonWebToken");
const crypto = require("crypto");
const path = require("path");
const upload = require(path.join(
  __dirname,
  "..",
  "config",
  "cloudinaryStorage"
));

exports.register = [
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill the required fields",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      let profilePicUrl = null;
      let resumeUrl = null;

      if (req.files) {
        profilePicUrl = req.files.profilePic
          ? req.files.profilePic[0].path
          : null;
        resumeUrl = req.files.resume ? req.files.resume[0].path : null;
      }

      const newUser = new User({
        name,
        email,
        password,
        profilePic: profilePicUrl,
        resume: resumeUrl,
      });

      await newUser.save();

      const token = generateAuthToken(newUser._id, res);

      res.status(201).json({
        success: true,
        token,
        data: {
          name,
          email,
          profilePic: profilePicUrl,
          resume: resumeUrl,
        },
        message: "User registered successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server error",
        error: error.message,
      });
    }
  },
];

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const comparePassword = await user.comparePassword(password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const token = generateAuthToken(user._id, res);
    res.status(200).json({
      success: true,
      token,
      data: {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        resume: user.resume,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    const message = `Password reset token: ${resetURL}. It is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message: message,
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Failed to send reset token via email",
        error: emailError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset token sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    generateAuthToken(user._id, res);
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        resume: user.resume,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { currentPassword, newPassword } = req.body;
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();
    generateAuthToken(user._id, res);
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        resume: user.resume,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user comes from the isLogin middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        resume: user.resume,
      },
      message: "User details retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};
