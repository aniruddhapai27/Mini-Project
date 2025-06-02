const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isLogin = async (req, res, next) => {
  try {
    // Get the token from cookies only
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "You are not logged in. Please log in to access this resource.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    // Find the user
    const user = await User.findById(decoded.userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // Check if the user changed password after the token was issued
    if (user.changePasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password recently changed. Please log in again.",
      });
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
