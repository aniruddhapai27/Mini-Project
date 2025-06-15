import { useEffect, useState } from 'react';

// Streak Animation Component
export const StreakAnimation = ({ streak, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-orange-500/95 backdrop-blur-sm text-white px-8 py-6 rounded-xl shadow-2xl animate-bounce border border-orange-400">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">🔥</div>
          <div className="text-2xl font-bold mb-1">Streak: {streak}!</div>
          <div className="text-sm opacity-90">You're on fire!</div>
        </div>
      </div>
    </div>
  );
};

// Level Up Animation Component
export const LevelUpAnimation = ({ level, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particle positions
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 1000,
      angle: (i * 30) + Math.random() * 30,
      distance: 50 + Math.random() * 50
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Particle effects */}
      <div className="absolute">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-ping"
            style={{
              transform: `rotate(${particle.angle}deg) translateX(${particle.distance}px)`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '2s'
            }}
          >
            ⭐
          </div>
        ))}
      </div>
      
      {/* Main level up notification */}
      <div className="bg-purple-500/95 backdrop-blur-sm text-white px-8 py-6 rounded-xl shadow-2xl animate-pulse border border-purple-400 relative">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🏆</div>
          <div className="text-2xl font-bold mb-1">Level Up!</div>
          <div className="text-lg mb-1">You're now level {level}!</div>
          <div className="text-sm opacity-90">Keep up the great work!</div>
        </div>
      </div>
    </div>
  );
};

// Achievement Animation Component
export const AchievementAnimation = ({ achievement, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible || !achievement) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-cyan-500/95 backdrop-blur-sm text-white px-8 py-6 rounded-xl shadow-2xl animate-fadeIn border border-cyan-400 max-w-md mx-4">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">{achievement.icon}</div>
          <div className="text-xl font-bold mb-2">Achievement Unlocked!</div>
          <div className="text-lg font-semibold mb-1">{achievement.name}</div>
          <div className="text-sm opacity-90">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
};

// XP Gain Animation Component
export const XPGainAnimation = ({ xpGained, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <div className="bg-green-500/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-slideInRight border border-green-400">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⭐</span>
          <span className="font-bold">+{xpGained} XP</span>
        </div>
      </div>
    </div>
  );
};

// Confetti Component for celebrations
export const Confetti = ({ active, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2,
        emoji: ['🎉', '⭐', '🏆', '💫', '✨', '🎊'][Math.floor(Math.random() * 6)]
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce"
          style={{
            left: `${particle.left}%`,
            top: `-10%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
            transform: 'translateY(110vh)'
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  current, 
  total, 
  color = 'cyan', 
  height = 'h-2', 
  showPercentage = true,
  animated = true 
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between text-xs text-black/70 dark:text-white/70 mb-1">
          <span>{current}/{total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-black/10 dark:bg-white/10 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${colorClasses[color]} ${
            animated ? 'transition-all duration-700 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Skill Level Badge Component
export const SkillBadge = ({ level, domain, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const levelColors = {
    1: 'from-gray-500 to-gray-600',
    2: 'from-green-500 to-green-600',
    3: 'from-blue-500 to-blue-600',
    4: 'from-purple-500 to-purple-600',
    5: 'from-yellow-500 to-orange-500',
    6: 'from-red-500 to-pink-500'
  };

  const levelColor = levelColors[Math.min(level, 6)] || levelColors[1];

  return (
    <div className="text-center">
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br ${levelColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-2`}
      >
        {level}
      </div>
      <div className="text-xs text-black/70 dark:text-white/70 capitalize">
        {domain}
      </div>
    </div>
  );
};

// Gamification Stats Card Component
export const StatsCard = ({ 
  icon, 
  value, 
  label, 
  color = 'cyan', 
  trend = null, 
  size = 'md' 
}) => {
  const colorClasses = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-400',
    orange: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',
    yellow: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-400'
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl ${sizeClasses[size]} text-center backdrop-blur-sm`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-xl font-bold ${colorClasses[color].split(' ')[3]} mb-1`}>
        {value}
        {trend && (
          <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↗' : '↘'}
          </span>
        )}
      </div>
      <div className="text-xs text-black/70 dark:text-white/70">{label}</div>
    </div>
  );
};
