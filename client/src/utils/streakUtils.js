import { updateStreak } from '../redux/slices/authSlice';

// Utility function to update user streak after completing an activity
export const updateUserStreak = async (dispatch) => {
  try {
    await dispatch(updateStreak()).unwrap();
    return true;
  } catch (error) {
    console.error('Failed to update streak:', error);
    return false;
  }
};

// Function to check if user should get streak today
export const shouldUpdateStreak = (lastActivity) => {
  if (!lastActivity) return true;
  
  const today = new Date();
  const lastActivityDate = new Date(lastActivity);
  
  // Reset time to midnight for date comparison
  today.setHours(0, 0, 0, 0);
  lastActivityDate.setHours(0, 0, 0, 0);
  
  // Return true if last activity was not today
  return today.getTime() !== lastActivityDate.getTime();
};

// Get streak status text
export const getStreakStatus = (currentStreak, maxStreak, lastActivity) => {
  const today = new Date();
  const lastActivityDate = lastActivity ? new Date(lastActivity) : null;
  
  if (!lastActivityDate) {
    return {
      status: 'inactive',
      message: 'Start your streak today!',
      color: 'text-gray-400'
    };
  }
  
  const daysSinceActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceActivity === 0) {
    return {
      status: 'active',
      message: `🔥 ${currentStreak} day streak!`,
      color: 'text-green-400'
    };
  } else if (daysSinceActivity === 1) {
    return {
      status: 'at_risk',
      message: 'Complete an activity to maintain your streak!',
      color: 'text-yellow-400'
    };
  } else {
    return {
      status: 'broken',
      message: 'Streak broken. Start a new one today!',
      color: 'text-red-400'
    };
  }
};

export default {
  updateUserStreak,
  shouldUpdateStreak,
  getStreakStatus
};
