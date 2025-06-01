const express = require('express');

const {
    updateStreak,
} = require('../controllers/userController');

const { isLogin } = require('../middlewares/isLogin');

const userRouter = express.Router();

userRouter.patch('/update-streak', isLogin, updateStreak);

module.exports = userRouter;