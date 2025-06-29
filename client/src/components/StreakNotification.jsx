import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StreakNotification = ({ show, streakCount, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getStreakMessage = (count) => {
    if (count === 1) return "Streak started! 🌱";
    if (count <= 3) return `${count} day streak! 🔥`;
    if (count <= 7) return `${count} days strong! 💪`;
    if (count <= 14) return `${count} days amazing! 🚀`;
    if (count <= 21) return `${count} days incredible! ⭐`;
    return `${count} days unstoppable! ⚡`;
  };

  const getStreakColor = (count) => {
    if (count <= 3) return "from-green-500 to-emerald-600";
    if (count <= 7) return "from-yellow-500 to-orange-600";
    if (count <= 14) return "from-orange-500 to-red-600";
    if (count <= 21) return "from-red-500 to-pink-600";
    return "from-purple-500 to-blue-600";
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.5 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`bg-gradient-to-r ${getStreakColor(streakCount)} p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm`}>
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1.2, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2
                }}
                className="text-4xl"
              >
                🔥
              </motion.div>
              
              <div className="text-white">
                <h3 className="text-xl font-bold">
                  {getStreakMessage(streakCount)}
                </h3>
                <p className="text-sm opacity-90">
                  Keep it up! You're building great habits.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-white/70 hover:text-white text-xl ml-4"
              >
                ×
              </button>
            </div>
            
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{ 
                    opacity: 0,
                    x: Math.random() * 300,
                    y: Math.random() * 100,
                    scale: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [null, Math.random() * 50 - 25]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakNotification;
