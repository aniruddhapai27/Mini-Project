import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getInterviewSession,
  updateInterviewSession,
  endInterviewSession,
  setUserResponse,
  resetCurrentSession,
  selectCurrentSession,
  selectSessionLoading,
  selectSessionError,
  selectUserResponse,
  selectIsWaitingForAI,
  selectUpdateError,
  selectLevel,
  selectStreakCount,
  hideStreakAnimation,
  hideLevelUpAnimation,
  hideAchievementAnimation,
  selectShowStreakAnimation,
  selectShowLevelUpAnimation,
  selectShowAchievementAnimation
} from '../redux/slices/interviewSlice';

const MockInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  // Redux state
  const currentSession = useSelector(selectCurrentSession);
  const sessionLoading = useSelector(selectSessionLoading);
  const sessionError = useSelector(selectSessionError);
  const userResponse = useSelector(selectUserResponse);
  const isWaitingForAI = useSelector(selectIsWaitingForAI);
  const updateError = useSelector(selectUpdateError);
  const level = useSelector(selectLevel);
  const streakCount = useSelector(selectStreakCount);
  
  // Animation states
  const showStreakAnimation = useSelector(selectShowStreakAnimation);
  const showLevelUpAnimation = useSelector(selectShowLevelUpAnimation);
  const showAchievementAnimation = useSelector(selectShowAchievementAnimation);

  // Local state
  const [questionCount, setQuestionCount] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Initialize interview session
  useEffect(() => {
    if (sessionId) {
      dispatch(getInterviewSession(sessionId));
    }
  }, [dispatch, sessionId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userResponse]);  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && userResponse.trim() && !isWaitingForAI) {
        handleSendResponse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [userResponse, isWaitingForAI, handleSendResponse]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCurrentSession());
    };
  }, [dispatch]);
  const handleSendResponse = useCallback(async () => {
    if (!userResponse.trim() || isWaitingForAI) return;

    const currentAIQuestion = getCurrentAIQuestion();
    
    try {
      await dispatch(updateInterviewSession({
        sessionId,
        bot: currentAIQuestion,
        user: userResponse
      })).unwrap();

      setQuestionCount(prev => prev + 1);
      
      // Check if we should end the interview (after 5-7 questions)
      if (questionCount >= 4) {
        setTimeout(() => {
          setShowEndModal(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    }
  }, [dispatch, sessionId, userResponse, isWaitingForAI, questionCount, getCurrentAIQuestion]);
  const getCurrentAIQuestion = useCallback(() => {
    if (!currentSession?.QnA || currentSession.QnA.length === 0) {
      return "Welcome to your mock interview! Please start by introducing yourself and telling me about your background.";
    }
    
    const lastQnA = currentSession.QnA[currentSession.QnA.length - 1];
    return lastQnA?.bot || "Please continue with your response.";
  }, [currentSession]);

  const handleEndInterview = async () => {
    try {
      // Calculate a sample score based on question count and responses
      const score = Math.min(100, Math.max(60, (questionCount * 15) + Math.floor(Math.random() * 20)));
      const feedback = `Great job! You completed ${questionCount} questions with thoughtful responses. Your communication skills are developing well.`;

      await dispatch(endInterviewSession({
        sessionId,
        finalScore: score,
        feedback
      })).unwrap();

      navigate('/mock-interview-results', {
        state: {
          sessionId,
          session: currentSession,
          score,
          feedback,
          questionCount
        }
      });
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  };

  const handleStartInterview = () => {
    setInterviewStarted(true);
    dispatch(setUserResponse("Hello! I'm excited to participate in this mock interview. I'm [Your Name], and I have experience in..."));
  };

  const getProgressPercentage = () => {
    const maxQuestions = 6;
    return Math.min(100, (questionCount / maxQuestions) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'technical': return '💻';
      case 'behavioral': return '🤝';
      case 'system-design': return '🏗️';
      case 'product': return '📱';
      default: return '🎯';
    }
  };

  // Animations
  const StreakAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-orange-500/90 text-white px-8 py-4 rounded-xl shadow-xl animate-bounce">
        <div className="text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-xl font-bold">Streak: {streakCount}!</div>
          <div className="text-sm">You're on fire!</div>
        </div>
      </div>
    </div>
  );

  const LevelUpAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-purple-500/90 text-white px-8 py-4 rounded-xl shadow-xl animate-pulse">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-xl font-bold">Level Up!</div>
          <div className="text-sm">You're now level {level}!</div>
        </div>
      </div>
    </div>
  );

  const AchievementAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-cyan-500/90 text-white px-8 py-4 rounded-xl shadow-xl animate-fadeIn">
        <div className="text-center">
          <div className="text-4xl mb-2">{showAchievementAnimation?.icon}</div>
          <div className="text-xl font-bold">{showAchievementAnimation?.name}</div>
          <div className="text-sm">{showAchievementAnimation?.description}</div>
        </div>
      </div>
    </div>
  );

  // Hide animations after delay
  useEffect(() => {
    if (showStreakAnimation) {
      const timer = setTimeout(() => dispatch(hideStreakAnimation()), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStreakAnimation, dispatch]);

  useEffect(() => {
    if (showLevelUpAnimation) {
      const timer = setTimeout(() => dispatch(hideLevelUpAnimation()), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUpAnimation, dispatch]);

  useEffect(() => {
    if (showAchievementAnimation) {
      const timer = setTimeout(() => dispatch(hideAchievementAnimation()), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAchievementAnimation, dispatch]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 mb-4">{sessionError}</p>
          <button
            onClick={() => navigate('/mock-interview-selection')}
            className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-black dark:text-white">No interview session found</p>
          <button
            onClick={() => navigate('/mock-interview-selection')}
            className="mt-4 py-2 px-6 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-300"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>        {/* Hexagon Pattern */}
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
        <div className="absolute inset-0 opacity-8">
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
        </div>        {/* Floating Geometric Shapes */}
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

      {/* Animations */}
      {showStreakAnimation && <StreakAnimation />}
      {showLevelUpAnimation && <LevelUpAnimation />}
      {showAchievementAnimation && <AchievementAnimation />}

      {/* Interview Header */}
      <div className="border-b border-gray-700/20 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40 relative">
        <div className="container mx-auto px-4 py-4">          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="text-3xl">{getDomainIcon(currentSession.domain)}</div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {currentSession.domain?.charAt(0).toUpperCase() + currentSession.domain?.slice(1)} Interview
                </h1>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getDifficultyColor(currentSession.difficulty)}`}>
                    {currentSession.difficulty?.toUpperCase()}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-300">
                    Question {questionCount + 1}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress and Controls */}
            <div className="flex items-center space-x-4">
              <div className="w-32">
                <div className="flex justify-between text-xs text-black/70 dark:text-white/70 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => setShowEndModal(true)}
                className="py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!interviewStarted ? (
          /* Interview Introduction */
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-8">
              <div className="text-6xl mb-4">{getDomainIcon(currentSession.domain)}</div>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
                Ready for Your {currentSession.domain?.charAt(0).toUpperCase() + currentSession.domain?.slice(1)} Interview?
              </h2>
              <p className="text-lg text-black/70 dark:text-white/70 mb-6">
                This is a {currentSession.difficulty} level interview. Take your time to think through your responses.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-black dark:text-white mb-1">Be Specific</h4>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Provide detailed answers with examples
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💭</div>
                  <h4 className="font-semibold text-black dark:text-white mb-1">Think Aloud</h4>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Share your thought process
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">⌨️</div>
                  <h4 className="font-semibold text-black dark:text-white mb-1">Use Ctrl+Enter</h4>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Quick shortcut to send responses
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleStartInterview}
                className="py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-105"
              >
                🚀 Start Interview
              </button>
            </div>
          </div>
        ) : (
          /* Interview Chat Interface */
          <div className="space-y-6">
            {/* Chat Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* AI Question */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <p className="text-black dark:text-white leading-relaxed">
                    {getCurrentAIQuestion()}
                  </p>
                </div>
              </div>

              {/* Show conversation history */}
              {currentSession.QnA?.map((qna, index) => (
                <div key={index} className="space-y-4">
                  {/* User Response */}
                  <div className="flex items-start space-x-3 flex-row-reverse">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      YOU
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-black dark:text-white leading-relaxed">
                        {qna.user}
                      </p>
                    </div>
                  </div>

                  {/* AI Follow-up (if there's a next question) */}
                  {index < currentSession.QnA.length - 1 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-black dark:text-white leading-relaxed">
                          {currentSession.QnA[index + 1]?.bot}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* AI Thinking Indicator */}
              {isWaitingForAI && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-cyan-400 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Input Area */}
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Your Response
                </label>
                <textarea
                  ref={textareaRef}
                  value={userResponse}
                  onChange={(e) => dispatch(setUserResponse(e.target.value))}
                  placeholder="Type your response here... (Ctrl+Enter to send)"
                  className="w-full p-4 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none min-h-[120px] max-h-[300px]"
                  disabled={isWaitingForAI}
                />
              </div>

              {updateError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {updateError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-black/70 dark:text-white/70">
                  <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-xs">Ctrl</kbd>
                  {' + '}
                  <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-xs">Enter</kbd>
                  {' to send'}
                </div>
                
                <button
                  onClick={handleSendResponse}
                  disabled={!userResponse.trim() || isWaitingForAI}
                  className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    !userResponse.trim() || isWaitingForAI
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 hover:scale-105 shadow-lg'
                  }`}
                >
                  {isWaitingForAI ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Response'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">
              End Interview?
            </h3>
            <p className="text-black/70 dark:text-white/70 mb-6">
              Are you sure you want to end this interview session? You'll receive feedback and scoring.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2 px-4 border border-black/20 dark:border-white/20 text-black dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                Continue
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
