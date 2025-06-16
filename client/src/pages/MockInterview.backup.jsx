import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import {
  setUserResponse,
  resetCurrentSession,
  selectUserResponse,
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
  console.log('MockInterview component is rendering');
  
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  console.log('Session ID:', sessionId);
  console.log('Location state:', location.state);

  // Redux state
  const userResponse = useSelector(selectUserResponse);
  const level = useSelector(selectLevel);
  const streakCount = useSelector(selectStreakCount);
  
  // Animation states
  const showStreakAnimation = useSelector(selectShowStreakAnimation);
  const showLevelUpAnimation = useSelector(selectShowLevelUpAnimation);
  const showAchievementAnimation = useSelector(selectShowAchievementAnimation);
  // Local state for conversation
  const [conversation, setConversation] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const sessionData = location.state || { domain: 'hr', difficulty: 'medium' };

  // Handle sending user response
  const handleSendResponse = useCallback(async () => {
    if (!userResponse.trim() || isTyping) return;

    const userMessage = userResponse.trim();
    dispatch(setUserResponse(''));

    // Add user message to conversation
    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, newUserMessage]);

    // Get AI response
    const aiResponse = await sendMessageToPythonAPI(userMessage);
    
    // Add AI response to conversation
    const newAIMessage = {
      type: 'ai',
      message: aiResponse,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, newAIMessage]);

    // Check if we should suggest ending (after 5 exchanges)
    if (conversation.length >= 10) { // 5 user + 5 AI messages
      setTimeout(() => {
        setShowEndModal(true);
      }, 2000);
    }
  }, [userResponse, isTyping, conversation.length, dispatch, sendMessageToPythonAPI]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [userResponse]);

  // Domain formatting helpers
  const getDomainIcon = (domain) => {
    const icons = {
      'hr': '👥',
      'dataScience': '📊', 
      'data-science': '📊',
      'webdev': '💻',
      'fullTechnical': '⚡',
      'full-technical': '⚡'
    };
    return icons[domain] || '🎯';
  };

  const formatDomainName = (domain) => {
    const names = {
      'hr': 'HR Interview',
      'dataScience': 'Data Science',
      'data-science': 'Data Science', 
      'webdev': 'Web Development',
      'fullTechnical': 'Full Technical',
      'full-technical': 'Full Technical'
    };
    return names[domain] || domain;
  };
  // Send message to Python API
  const sendMessageToPythonAPI = useCallback(async (message) => {
    try {
      setIsTyping(true);
      
      const formData = new FormData();
      // Create a default resume file
      const defaultResume = new Blob(['Sample resume content for interview'], { type: 'text/plain' });
      formData.append('file', defaultResume, 'resume.txt');
      
      formData.append('domain', sessionData.domain);
      formData.append('difficulty', sessionData.difficulty);
      formData.append('user_response', message);
      
      if (currentSessionId && currentSessionId !== 'new') {
        formData.append('session', currentSessionId);
      }

      const response = await api.post('/api/v1/services/interview/resume-based', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.session_id) {
        setCurrentSessionId(response.data.session_id);
      }

      return response.data?.ai || 'I apologize, but there was an issue generating my response. Please try again.';
    } catch (error) {
      console.error('Error calling Python API:', error);
      return 'I encountered an error. Please check your connection and try again.';
    } finally {
      setIsTyping(false);
    }
  }, [sessionData.domain, sessionData.difficulty, currentSessionId]);
  // Handle starting the interview
  const handleStartInterview = async () => {
    setInterviewStarted(true);
    
    const welcomeMessage = "Hello! I'm your AI interviewer. Let's start with a simple question: Can you please introduce yourself and tell me about your background?";
    
    setConversation([{
      type: 'ai',
      message: welcomeMessage,
      timestamp: new Date()
    }]);
  };

  // Handle ending interview
  const handleEndInterview = async () => {
    try {
      const finalScore = Math.max(60, Math.min(100, 60 + (conversation.length * 5)));
      
      navigate('/mock-interview-results', { 
        state: { 
          sessionId: currentSessionId,
          conversation,
          domain: sessionData.domain,
          difficulty: sessionData.difficulty,
          score: finalScore
        }
      });
    } catch (error) {
      console.error('Failed to end interview:', error);
      navigate('/mock-interview-results', { 
        state: { 
          conversation,
          domain: sessionData.domain,
          difficulty: sessionData.difficulty,
          score: 70
        }
      });
    }
  };
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && userResponse.trim() && !isTyping) {
        e.preventDefault();
        handleSendResponse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [userResponse, isTyping, handleSendResponse]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCurrentSession());
    };
  }, [dispatch]);

  // Animation components
  const StreakAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-xl animate-bounce">
        <div className="text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-xl font-bold">{streakCount} Day Streak!</div>
          <div className="text-sm">Keep it up!</div>
        </div>
      </div>
    </div>
  );

  const LevelUpAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl shadow-xl animate-pulse">
        <div className="text-center">
          <div className="text-4xl mb-2">⭐</div>
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
    }  }, [showAchievementAnimation, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="cyan" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Animated circuit lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/50 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute left-0 top-1/4 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl animate-pulse">{getDomainIcon(sessionData.domain)}</div>
              <div>
                <h1 className="text-white text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {formatDomainName(sessionData.domain)} Interview
                </h1>
                <p className="text-cyan-400 text-sm">
                  <span className="capitalize">{sessionData.difficulty} Level</span>
                  {conversation.length > 0 && (
                    <span className="ml-2">• Question {Math.floor(conversation.length / 2) + 1}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {interviewStarted && (
                <div className="text-center">
                  <div className="text-white text-sm">Progress</div>
                  <div className="text-cyan-400 text-lg font-bold">
                    {Math.floor(conversation.length / 2)}/5
                  </div>
                </div>
              )}
              {interviewStarted && (
                <button
                  onClick={() => setShowEndModal(true)}
                  className="py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm border border-red-500/30 hover:shadow-lg hover:shadow-red-500/25"
                >
                  End Interview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {!interviewStarted ? (
          /* Interview Introduction */
          <div className="text-center space-y-8">
            <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-8xl mb-6 animate-pulse">{getDomainIcon(sessionData.domain)}</div>
              <h2 className="text-4xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Interview System Ready
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Welcome to your personalized <span className="text-cyan-400 font-semibold">{formatDomainName(sessionData.domain)}</span> interview experience.
                <br />
                This is a <span className="text-purple-400 font-semibold capitalize">{sessionData.difficulty}</span> level interview powered by advanced AI.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-black/20 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="text-3xl mb-4 animate-bounce">🎯</div>
                  <h4 className="font-semibold text-white mb-2">Be Specific</h4>
                  <p className="text-sm text-gray-400">
                    Provide detailed answers with concrete examples
                  </p>
                </div>
                <div className="text-center p-6 bg-black/20 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                  <div className="text-3xl mb-4 animate-bounce" style={{animationDelay: '0.2s'}}>💭</div>
                  <h4 className="font-semibold text-white mb-2">Think Aloud</h4>
                  <p className="text-sm text-gray-400">
                    Share your thought process and reasoning
                  </p>
                </div>
                <div className="text-center p-6 bg-black/20 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="text-3xl mb-4 animate-bounce" style={{animationDelay: '0.4s'}}>⌨️</div>
                  <h4 className="font-semibold text-white mb-2">Quick Send</h4>
                  <p className="text-sm text-gray-400">
                    Use Ctrl+Enter to send responses quickly
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleStartInterview}
                className="group py-4 px-8 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Initialize Interview</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Conversational Interface */
          <div className="space-y-6">
            {/* Chat Container */}
            <div 
              ref={chatContainerRef}
              className="bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 h-96 overflow-y-auto space-y-4 shadow-2xl custom-scrollbar"
            >
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 animate-fadeIn ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    message.type === 'ai' 
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-500 animate-pulse' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'ai' ? '🤖' : '👤'}
                  </div>
                  
                  {/* Message */}
                  <div className={`flex-1 max-w-[70%] ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                      message.type === 'ai'
                        ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white'
                        : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-white'
                    }`}>
                      <p className="leading-relaxed text-sm md:text-base">{message.message}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-4 animate-fadeIn">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
                    🤖
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-cyan-400 text-sm">AI is analyzing your response...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Your Response</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </label>
                <textarea
                  ref={textareaRef}
                  value={userResponse}
                  onChange={(e) => dispatch(setUserResponse(e.target.value))}
                  placeholder="Type your response here... (Ctrl+Enter to send)"
                  className="w-full p-4 border border-cyan-500/30 rounded-xl bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none min-h-[100px] max-h-[200px] backdrop-blur-sm transition-all duration-300"
                  disabled={isTyping}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-black/50 border border-cyan-500/30 rounded text-xs text-cyan-400">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-black/50 border border-cyan-500/30 rounded text-xs text-cyan-400">Enter</kbd>
                  <span>to send</span>
                </div>
                
                <button
                  onClick={handleSendResponse}
                  disabled={!userResponse.trim() || isTyping}
                  className={`group py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                    !userResponse.trim() || isTyping
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105'
                  }`}
                >
                  {!userResponse.trim() || isTyping ? null : (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  {isTyping ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span className="relative flex items-center space-x-2">
                      <span>Send</span>
                      <span>📤</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                End Interview Session?
              </h3>
              <p className="text-gray-300 text-sm">
                Are you sure you want to end this interview? You'll receive detailed feedback and scoring.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 px-4 border border-cyan-500/30 text-white rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
              >
                Continue
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      {showStreakAnimation && <StreakAnimation />}
      {showLevelUpAnimation && <LevelUpAnimation />}
      {showAchievementAnimation && <AchievementAnimation />}
      
      {/* Custom CSS for animations and scrollbar */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default MockInterview;
