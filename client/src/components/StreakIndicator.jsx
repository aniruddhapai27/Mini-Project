import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const StreakIndicator = ({ className = "" }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user || !user.currentStreak) {
    return null;
  }

  const getStreakEmoji = (streak) => {
    if (streak < 3) return '🌱';
    if (streak < 7) return '🔥';
    if (streak < 14) return '🚀';
    if (streak < 21) return '⭐';
    return '⚡';
  };

  const getStreakColor = (streak) => {
    if (streak < 3) return 'text-green-400';
    if (streak < 7) return 'text-yellow-400';
    if (streak < 14) return 'text-orange-400';
    if (streak < 21) return 'text-red-400';
    return 'text-purple-400';
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-full px-3 py-1 ${className}`}
      title={`${user.currentStreak} day streak! Best: ${user.maxStreak}`}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="text-sm"
      >
        {getStreakEmoji(user.currentStreak)}
      </motion.span>
      <span className={`text-sm font-bold ${getStreakColor(user.currentStreak)}`}>
        {user.currentStreak}
      </span>
    </motion.div>
  );
};

export default StreakIndicator;
