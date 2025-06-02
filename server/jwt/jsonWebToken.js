const jwt = require("jsonwebtoken");

const generateAuthToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie("jwt", token, {
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    httpOnly: true,
    secure: isProduction, // True if in production (assumes HTTPS)
    sameSite: isProduction ? "None" : "Lax", // "None" for production (requires Secure=true), "Lax" for development
  });
  return token;
};

module.exports = generateAuthToken;
