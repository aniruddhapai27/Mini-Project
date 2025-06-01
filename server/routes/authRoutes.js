const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
} = require("../controllers/authController");
const { isLogin } = require("../middlewares/isLogin");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/update-password", isLogin, updatePassword);
router.get("/me", isLogin, getMe);

module.exports = router;
