import React from 'react';
import { motion } from 'framer-motion';

const StreakVisualizer = ({ currentStreak, maxStreak, lastActivity, className = "" }) => {
  // Calculate the streak visualization
  const today = new Date();
  const lastActivityDate = lastActivity ? new Date(lastActivity) : null;
  
  // Calculate if streak is active (activity within last 24 hours)
  const isStreakActive = lastActivityDate && 
    (today - lastActivityDate) < (24 * 60 * 60 * 1000);

  // Generate streak visualization data
  const generateStreakData = () => {
    const data = [];
    const baseDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      const isActive = i < currentStreak;
      const isToday = i === 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        active: isActive,
        isToday: isToday,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate()
      });
    }
    
    return data;
  };

  const streakData = generateStreakData();

  // Get streak color based on length
  const getStreakColor = () => {
    if (currentStreak === 0) return 'text-gray-500';
    if (currentStreak < 7) return 'text-green-400';
    if (currentStreak < 14) return 'text-yellow-400';
    if (currentStreak < 21) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStreakEmoji = () => {
    if (currentStreak === 0) return '💤';
    if (currentStreak < 7) return '🌱';
    if (currentStreak < 14) return '🔥';
    if (currentStreak < 21) return '🚀';
    return '⚡';
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-cyan-500/30 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ scale: isStreakActive ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: isStreakActive ? Infinity : 0 }}
            className="text-2xl"
          >
            {getStreakEmoji()}
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Activity Streak</h3>
            <p className="text-sm text-gray-400">Keep learning every day!</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getStreakColor()}`}>
            {currentStreak}
          </div>
          <div className="text-xs text-gray-400">
            Current
          </div>
        </div>
      </div>

      {/* Streak Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs text-gray-400 text-center py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {streakData.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`
                aspect-square rounded-md relative group cursor-pointer
                ${day.active 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg' 
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
                }
                ${day.isToday ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-800' : ''}
                transition-all duration-200 hover:scale-110
              `}
              title={`${day.date} ${day.active ? '✓' : '✗'}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-medium ${
                  day.active ? 'text-white' : 'text-gray-400'
                }`}>
                  {day.dayOfMonth}
                </span>
              </div>
              
              {day.active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-gray-800"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-400">{maxStreak}</div>
          <div className="text-xs text-gray-400">Best Streak</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-cyan-400">
            {Math.round((currentStreak / (maxStreak || 1)) * 100)}%
          </div>
          <div className="text-xs text-gray-400">Of Best</div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-4 text-center">
        {currentStreak === 0 && (
          <p className="text-sm text-gray-400">
            Start your streak today! Complete any activity to begin.
          </p>
        )}
        {currentStreak > 0 && currentStreak < 7 && (
          <p className="text-sm text-green-400">
            Great start! Keep going to build your streak.
          </p>
        )}
        {currentStreak >= 7 && currentStreak < 14 && (
          <p className="text-sm text-yellow-400">
            One week strong! You're building great habits.
          </p>
        )}
        {currentStreak >= 14 && currentStreak < 21 && (
          <p className="text-sm text-orange-400">
            Two weeks! You're on fire! 🔥
          </p>
        )}
        {currentStreak >= 21 && (
          <p className="text-sm text-red-400">
            Incredible dedication! You're unstoppable! ⚡
          </p>
        )}
      </div>
    </div>
  );
};

export default StreakVisualizer;
