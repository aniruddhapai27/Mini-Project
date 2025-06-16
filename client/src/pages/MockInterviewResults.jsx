import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  selectLevel,
  selectTotalXP,
  selectStreakCount,
  selectAchievements,
  resetCurrentSession
} from '../redux/slices/interviewSlice';

const MockInterviewResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const level = useSelector(selectLevel);
  const totalXP = useSelector(selectTotalXP);
  const streakCount = useSelector(selectStreakCount);
  const achievements = useSelector(selectAchievements);
  // Get data from navigation state or provide defaults
  const {
    conversation = [],
    domain = 'hr',
    difficulty = 'medium',
    score = 75,
    feedback = 'Great job on completing the interview! Keep practicing to improve your skills.',
    questionCount = conversation.length
  } = location.state || {};

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    // Show confetti animation for good scores
    if (score >= 80) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }
  }, [score]);

  useEffect(() => {
    // Clean up session when leaving
    return () => {
      dispatch(resetCurrentSession());
    };
  }, [dispatch]);

  const handleNewInterview = () => {
    navigate('/mock-interview-selection');
  };

  const handleViewHistory = () => {
    navigate('/profile');
  };

  const getPerformanceIcon = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📈';
    return '💪';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const calculateXPGained = (score, difficulty) => {
    const baseXP = 10;
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2
    };
    const scoreMultiplier = score / 100;
    
    return Math.floor(baseXP * difficultyMultiplier[difficulty] * scoreMultiplier);
  };

  // Format domain names for display
  const formatDomainName = (domain) => {
    switch (domain) {
      case 'hr': return 'HR';
      case 'data-science': return 'Data Science';
      case 'webdev': return 'Web Development';
      case 'full-technical': return 'Full Technical';
      default: return domain?.charAt(0).toUpperCase() + domain?.slice(1);
    }
  };

  // Confetti Component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          {['🎉', '⭐', '🏆', '💫', '✨'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
  if (!conversation || conversation.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-black dark:text-white mb-4">No interview results found</p>
          <button
            onClick={handleNewInterview}
            className="py-2 px-6 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-300"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-8">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon fill="none" stroke="white" strokeWidth="1" points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="20" y="20" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="30" cy="10" r="2" fill="white" opacity="0.3"/>
                <circle cx="50" cy="30" r="2" fill="white" opacity="0.3"/>
                <circle cx="30" cy="50" r="2" fill="white" opacity="0.3"/>
                <circle cx="10" cy="30" r="2" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-16 left-16 w-4 h-4 bg-white opacity-20 rotate-45 animate-float-slow"></div>
        <div className="absolute top-24 right-24 w-6 h-6 bg-gray-300 opacity-25 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-16 right-16 w-5 h-5 bg-gray-400 opacity-22 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white opacity-35 rotate-45 animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-gray-500 opacity-20 rounded-full animate-float-fast"></div>

        {/* Diamond Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diamonds" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-0 top-1/5 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-gray-400/15 to-transparent animate-pulse" style={{ animationDelay: "3s" }}></div>

        {/* Particle System */}
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-white opacity-40 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-gray-300 opacity-50 rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white opacity-60 rounded-full animate-ping" style={{ animationDelay: "2s" }}></div>
      </div>

      {confettiActive && <Confetti />}
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview Complete!
          </h1>          <p className="text-lg text-gray-300">
            {formatDomainName(domain)} Interview Results
          </p>
        </div>

        {/* Main Results Card */}
        <div className="bg-gradient-to-br from-gray-600/10 to-gray-800/10 border border-gray-500/30 rounded-xl p-8 mb-8 shadow-xl animate-fadeIn">
          <div className="text-center">
            {/* Performance Icon and Score */}
            <div className="text-6xl mb-4">{getPerformanceIcon(score)}</div>
            <div className="text-6xl font-bold mb-2 text-white">
              {score}%
            </div>
            <div className={`text-2xl font-semibold mb-6 ${getPerformanceColor(score)}`}>
              {getPerformanceLevel(score)}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="w-full h-4 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${score}%`,
                    background: score >= 80
                      ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                      : score >= 60
                      ? 'linear-gradient(90deg, #eab308 0%, #ca8a04 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{questionCount}</div>
                <div className="text-sm text-black/70 dark:text-white/70">Questions</div>
              </div>
                <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">
                  {difficulty?.toUpperCase()}
                </div>
                <div className="text-sm text-black/70 dark:text-white/70">Difficulty</div>
              </div>
              
              <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  +{calculateXPGained(score, difficulty)}
                </div>
                <div className="text-sm text-black/70 dark:text-white/70">XP Gained</div>
              </div>
              
              <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{streakCount}</div>
                <div className="text-sm text-black/70 dark:text-white/70">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center animate-fadeIn">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-xl font-bold text-purple-400">Level {level}</div>
            <div className="text-sm text-black/70 dark:text-white/70">Current Level</div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center animate-fadeIn">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-xl font-bold text-cyan-400">{totalXP}</div>
            <div className="text-sm text-black/70 dark:text-white/70">Total XP</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 text-center animate-fadeIn">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-xl font-bold text-orange-400">{streakCount}</div>
            <div className="text-sm text-black/70 dark:text-white/70">Day Streak</div>
          </div>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 animate-fadeIn">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🏅</span>
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(-3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 bg-black/5 dark:bg-white/5 rounded-lg p-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-semibold text-black dark:text-white text-sm">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-black/70 dark:text-white/70">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-6 mb-8 animate-fadeIn">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            AI Feedback
          </h3>
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
            <p className="text-black dark:text-white leading-relaxed">
              {feedback}
            </p>
          </div>
        </div>

        {/* Interview Conversation (Detailed View) */}
        <div className="mb-8">
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="flex items-center justify-center w-full py-3 px-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300"
          >
            <svg
              className={`w-5 h-5 mr-2 transition-transform ${showDetailedView ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showDetailedView ? 'Hide' : 'Show'} Interview Conversation
          </button>

          {showDetailedView && (
            <div className="mt-4 space-y-4 animate-fadeIn">              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Complete Interview Transcript
              </h3>
              {conversation?.map((item, index) => (
                <div key={index} className="space-y-3">
                  {/* AI Question */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
                      <p className="text-black dark:text-white text-sm leading-relaxed">
                        {item.question || item.bot}
                      </p>
                    </div>
                  </div>
                  
                  {/* User Response */}
                  <div className="flex items-start space-x-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      YOU
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-black dark:text-white text-sm leading-relaxed">
                        {item.answer || item.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
          <button
            onClick={handleNewInterview}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Interview
            </div>
          </button>
          
          <button
            onClick={handleViewHistory}
            className="flex-1 py-4 px-6 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 text-black dark:text-white rounded-xl font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View History
            </div>
          </button>
        </div>

        {/* Tips for Improvement */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips for Next Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Practice Regularly</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Regular practice helps build confidence
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Focus on Examples</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Use specific examples in your answers
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Time Management</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Keep answers concise but complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewResults;
