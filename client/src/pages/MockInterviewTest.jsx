import { useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setUserResponse,
  startInterview,
  resetInterview,
  selectUserResponse,
  selectLevel,
  selectStreakCount,
  selectConversation,
  selectCurrentSessionId,
  selectInterviewStarted,
  selectAiResponseLoading,
  hideStreakAnimation,
  hideLevelUpAnimation,
  hideAchievementAnimation,
  selectShowStreakAnimation,
  selectShowLevelUpAnimation,
  selectShowAchievementAnimation,
  sendInterviewMessage,
} from "../redux/slices/interviewSlice";

const MockInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Memoize session data to prevent unnecessary re-renders
  const sessionData = useMemo(
    () => location.state || { domain: "hr", difficulty: "medium" },
    [location.state]
  );

  // Redux state
  const userResponse = useSelector(selectUserResponse);
  const level = useSelector(selectLevel);
  const streakCount = useSelector(selectStreakCount);
  const conversation = useSelector(selectConversation);
  const currentSessionId = useSelector(selectCurrentSessionId);
  const interviewStarted = useSelector(selectInterviewStarted);
  const aiResponseLoading = useSelector(selectAiResponseLoading);
  // Animation states
  const showStreakAnimation = useSelector(selectShowStreakAnimation);
  const showLevelUpAnimation = useSelector(selectShowLevelUpAnimation);
  const showAchievementAnimation = useSelector(selectShowAchievementAnimation);

  // Domain formatting helpers
  const getDomainIcon = (domain) => {
    const icons = {
      hr: "👥",
      dataScience: "📊",
      webdev: "💻",
      fullTechnical: "⚡",
    };
    return icons[domain] || "🎯";
  };

  const formatDomainName = (domain) => {
    const names = {
      hr: "HR Interview",
      dataScience: "Data Science",
      webdev: "Web Development",
      fullTechnical: "Full Technical",
    };
    return names[domain] || domain;
  };

  console.log(
    "MockInterview rendering - Session:",
    sessionId,
    "Started:",
    interviewStarted,
    "Conversation:",
    conversation.length
  );

  // Handle sending user response
  const handleSendResponse = useCallback(async () => {
    if (!userResponse.trim() || aiResponseLoading) return;

    const messageData = {
      domain: sessionData.domain,
      difficulty: sessionData.difficulty,
      userResponse: userResponse.trim(),
      sessionId: currentSessionId,
      resumeFile: null, // Will use default resume
    };

    // Add user message immediately (if not already handled by Redux)
    // Then delay AI response by 1 second
    setTimeout(() => {
      dispatch(sendInterviewMessage(messageData));
    }, 1000);

    if (conversation.length >= 10) {
      // 5 user + 5 AI messages
      // Could add end interview suggestion logic here if needed
      console.log("Interview has reached 5 exchanges, consider ending");
    }
  }, [
    userResponse,
    aiResponseLoading,
    sessionData,
    currentSessionId,
    conversation.length,
    dispatch,
  ]);

  // Handle starting the interview
  const handleStartInterview = useCallback(() => {
    console.log("Starting interview...");
    dispatch(startInterview());

    // For the first question, we send an initial message to the AI to get the first question
    const initialMessageData = {
      domain: sessionData.domain,
      difficulty: sessionData.difficulty,
      user_response:
        "Hello, I'm ready to start the interview. Please begin with your first question.",
      sessionId: null, // No session initially
      resumeFile: null, // Will use default resume
    };

    dispatch(sendInterviewMessage(initialMessageData));
  }, [dispatch, sessionData]);

  // Handle ending interview
  const handleEndInterview = useCallback(() => {
    try {
      const finalScore = Math.max(
        60,
        Math.min(100, 60 + conversation.length * 5)
      );

      navigate("/mock-interview-results", {
        state: {
          sessionId: currentSessionId,
          conversation,
          domain: sessionData.domain,
          difficulty: sessionData.difficulty,
          score: finalScore,
        },
      });
    } catch (error) {
      console.error("Failed to end interview:", error);
      navigate("/mock-interview-results", {
        state: {
          conversation,
          domain: sessionData.domain,
          difficulty: sessionData.difficulty,
          score: 70,
        },
      });
    }
  }, [navigate, currentSessionId, conversation, sessionData]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, aiResponseLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [userResponse]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        e.key === "Enter" &&
        userResponse.trim() &&
        !aiResponseLoading
      ) {
        e.preventDefault();
        handleSendResponse();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [userResponse, aiResponseLoading, handleSendResponse]);

  // Effect to update URL when session ID is received
  useEffect(() => {
    // If we have a session ID from Redux and current URL has "new" as sessionId, update the URL
    if (currentSessionId && sessionId === "new") {
      navigate(`/mock-interview/${currentSessionId}`, {
        replace: true, // Replace current URL instead of adding to history
        state: sessionData, // Keep the session data in location state
      });
    }
  }, [currentSessionId, sessionId, navigate, sessionData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetInterview());
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
          <div className="text-xl font-bold">
            {showAchievementAnimation?.name}
          </div>
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
      const timer = setTimeout(
        () => dispatch(hideAchievementAnimation()),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [showAchievementAnimation, dispatch]);
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center space-y-8">
            <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8">
              <div className="text-4xl mb-6 animate-pulse">
                {getDomainIcon(sessionData.domain)}
              </div>
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Interview System
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Domain:{" "}
                <span className="text-cyan-400">
                  {formatDomainName(sessionData.domain)}
                </span>
              </p>
              <p className="text-xl text-gray-300 mb-8">
                Difficulty:{" "}
                <span className="text-purple-400 capitalize">
                  {sessionData.difficulty}
                </span>
              </p>

              <button
                onClick={handleStartInterview}
                className="py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                🚀 Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-3xl">{getDomainIcon(sessionData.domain)}</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {formatDomainName(sessionData.domain)} Interview
            </h1>
          </div>
          <p className="text-gray-300">
            Difficulty:{" "}
            <span className="text-purple-400 capitalize">
              {sessionData.difficulty}
            </span>
            {conversation.length > 0 && (
              <span className="ml-4">
                • Question {Math.floor(conversation.length / 2) + 1}
              </span>
            )}
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 h-96 overflow-y-auto mb-6 space-y-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 animate-fadeIn ${
                message.type === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                  message.type === "ai"
                    ? "bg-gradient-to-br from-cyan-500 to-purple-500 animate-pulse"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}
              >
                {message.type === "ai" ? "🤖" : "👤"}
              </div>

              {/* Message */}
              <div
                className={`flex-1 max-w-[70%] ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                    message.type === "ai"
                      ? "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white"
                      : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-white"
                  }`}
                >
                  <p className="leading-relaxed text-sm md:text-base">
                    {message.message}
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {aiResponseLoading && (
            <div className="flex items-start space-x-4 animate-fadeIn">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
                🤖
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-cyan-400 text-sm">
                      AI is analyzing your response...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-3">
              <span>Your Response</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </label>
            <textarea
              ref={textareaRef}
              value={userResponse}
              onChange={(e) => dispatch(setUserResponse(e.target.value))}
              placeholder="Type your response here... (Ctrl+Enter to send)"
              className="w-full p-4 border border-cyan-500/30 rounded-xl bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none min-h-[100px] max-h-[200px] backdrop-blur-sm transition-all duration-300"
              disabled={aiResponseLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleSendResponse();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-black/50 border border-cyan-500/30 rounded text-xs text-cyan-400">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-black/50 border border-cyan-500/30 rounded text-xs text-cyan-400">
                Enter
              </kbd>
              <span>to send</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSendResponse}
                disabled={!userResponse.trim() || aiResponseLoading}
                className={`group py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                  !userResponse.trim() || aiResponseLoading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105"
                }`}
              >
                {!userResponse.trim() || aiResponseLoading ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {aiResponseLoading ? (
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
              <button
                onClick={handleEndInterview}
                className="py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      {showStreakAnimation && <StreakAnimation />}
      {showLevelUpAnimation && <LevelUpAnimation />}
      {showAchievementAnimation && <AchievementAnimation />}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MockInterview;
