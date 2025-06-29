import { updateStreak } from '../slices/authSlice';
import { shouldUpdateStreak } from '../../utils/streakUtils';

// Middleware to handle streak updates when activities are completed
const streakMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Actions that should trigger streak updates
  const streakTriggeringActions = [
    'dq/submitQuizAnswers/fulfilled',
    'interview/endInterviewSession/fulfilled'
  ];
  
  if (streakTriggeringActions.includes(action.type)) {
    const state = store.getState();
    const user = state.auth.user;
    
    // Only update streak if user exists and should get streak update today
    if (user && shouldUpdateStreak(user.lastActivity)) {
      // Check if the activity was successful
      let shouldUpdate = false;
      
      if (action.type === 'dq/submitQuizAnswers/fulfilled') {
        // Update streak for quiz completion regardless of score
        shouldUpdate = true;
      } else if (action.type === 'interview/endInterviewSession/fulfilled') {
        // Update streak for interview completion with score >= 70
        const finalScore = action.payload?.finalScore || 0;
        shouldUpdate = finalScore >= 70;
      }
      
      if (shouldUpdate) {
        // Dispatch streak update
        store.dispatch(updateStreak());
      }
    }
  }
  
  return result;
};

export default streakMiddleware;
