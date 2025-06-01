const User = require("../models/userModel");


exports.updateStreak = async(req, res) =>{
    try {
        const user = await User.findById(req.user._id);
        const today = new Date();
        const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
        
        if(lastActivity){
            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            if(diffDays === 1){
                user.currentStreak +=1;
            }else if(diffDays > 1){
                user.currentStreak = 1;
            }
        }else{
            user.currentStreak = 1;
        }

        user.maxStreak = Math.max(user.maxStreak, user.currentStreak);
        user.lastActivity = today;
        await user.save();
        res.status(200).json({
            success :true,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        })
    }
};