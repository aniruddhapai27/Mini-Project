import { useEffect, useRef, useCallback, useMemo, useState } from "react";
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
  setAiResponseLoading,
} from "../redux/slices/interviewSlice";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import DotLottieLoader from "../components/DotLottieLoader";

const MockInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [localConversation, setLocalConversation] = useState([]);

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
    setLocalConversation((prev) => [
      ...prev,
      {
        type: "user",
        message: userResponse.trim(),
        timestamp: Date.now(),
      },
    ]);

    // Clear the input field immediately
    dispatch(setUserResponse(""));

    // Force scroll to bottom immediately after sending message
    setTimeout(scrollToBottom, 50);

    // Keep focus on textarea after sending message
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Set AI response loading to true to show the "AI is analyzing" indicator immediately
    dispatch(setAiResponseLoading(true));

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

    // Set focus to the textarea after a short delay to allow rendering to complete
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 500);
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
  }, [navigate, currentSessionId, conversation, sessionData]); // Scroll to bottom of messages
  const scrollToBottom = () => {
    // First try to use the reference to the end element
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    // As a fallback, also scroll the container directly
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll when conversation changes, when AI is loading, or when local conversation changes
    scrollToBottom();
  }, [conversation, localConversation, aiResponseLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [userResponse]); // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = () => {
      // We're now handling keyboard shortcuts directly in the textarea's onKeyDown event
      // This global event listener is kept for consistency but not doing anything specific
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Reset local conversation when Redux conversation updates
  useEffect(() => {
    if (conversation.length > 0) {
      // Once Redux has processed messages, we can clear our local temporary ones
      setLocalConversation([]);

      // Focus the textarea after AI response is received
      // Using a small timeout to ensure the UI has updated
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [conversation]);

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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
              <div className="p-8 text-center space-y-6">
                <div className="text-5xl mb-4">
                  {getDomainIcon(sessionData.domain)}
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  AI Interview Preparation
                </h1>
                <p className="text-xl text-gray-300 mb-2">
                  Domain:{" "}
                  <span className="text-cyan-400 font-medium">
                    {formatDomainName(sessionData.domain)}
                  </span>
                </p>
                <p className="text-xl text-gray-300 mb-6">
                  Difficulty:{" "}
                  <span className="text-purple-400 font-medium capitalize">
                    {sessionData.difficulty}
                  </span>
                </p>

                <div className="mt-8">
                  <button
                    onClick={handleStartInterview}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                  >
                    🚀 Start Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {getDomainIcon(sessionData.domain)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {formatDomainName(sessionData.domain)} Interview
                </h1>
                <p className="text-sm text-gray-400">
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
            </div>
            <button
              onClick={handleEndInterview}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition duration-200"
            >
              End Interview
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Chat Container */}
          <div
            className="bg-gray-800 border animate-pulse-slow border-gray-700 rounded-lg p-4 h-[400px] overflow-y-auto mb-4"
            id="chat-container"
          >
            {" "}
            {conversation.length === 0 &&
            localConversation.length === 0 &&
            !aiResponseLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>
                  Your interview will start soon. Get ready for the first
                  question.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show all conversation messages from Redux, followed by any local messages that are not yet in Redux */}
                {[
                  ...conversation,
                  ...localConversation.filter(
                    (localMsg) =>
                      !conversation.some(
                        (reduxMsg) =>
                          reduxMsg.type === localMsg.type &&
                          reduxMsg.message === localMsg.message
                      )
                  ),
                ].map((message, index) => (
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${
                        message.type === "ai" ? "bg-blue-600" : "bg-purple-600"
                      }`}
                    >
                      {message.type === "ai" ? "🤖" : "👤"}
                    </div>

                    {/* Message */}
                    <div
                      className={`flex-1 max-w-[75%] ${
                        message.type === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg shadow ${
                          message.type === "ai"
                            ? "bg-gray-700 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        <p className="leading-relaxed">{message.message}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Typing Indicator */}
                {aiResponseLoading && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                      🤖
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-700 rounded-lg p-3 shadow">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-blue-400 text-sm">
                            AI is analyzing your response...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            {" "}
            <div className="mb-2">
              <label className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Your Response
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={userResponse}
                  onChange={(e) => dispatch(setUserResponse(e.target.value))}
                  placeholder="Type your response here... (Enter to send)"
                  className="w-full p-3 mt-1 bg-gray-700/90 border border-blue-500/40 rounded text-white placeholder-gray-400 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px] transition-all 
                    backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse-slow"
                  disabled={aiResponseLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      // Enter (without shift): Send response
                      e.preventDefault();
                      if (userResponse.trim() && !aiResponseLoading) {
                        handleSendResponse();
                      }
                    }
                  }}
                />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-sm opacity-20 animate-pulse-slow -z-10"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {" "}
              <div className="text-xs text-gray-400 flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs">
                  Enter
                </kbd>
                <span>to send</span>
                <span className="ml-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs ml-2">
                  Shift+Enter
                </kbd>
                <span>for new line</span>
              </div>{" "}
              <div className="relative">
                <button
                  onClick={handleSendResponse}
                  disabled={!userResponse.trim() || aiResponseLoading}
                  className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-300 shadow-lg relative z-10 ${
                    !userResponse.trim() || aiResponseLoading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  }`}
                >
                  {aiResponseLoading ? (
                    <DotLottieLoader 
                      size="sm" 
                      text="Processing..." 
                      layout="horizontal"
                      color="white"
                    />
                  ) : (
                    <span className="flex items-center space-x-1">
                      <span>Send Response</span>
                      <span>➤</span>
                    </span>
                  )}
                </button>
                {userResponse.trim() && !aiResponseLoading && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-md blur-sm opacity-40 animate-pulse-slow -z-0"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Animations */}
      {showStreakAnimation && <StreakAnimation />}
      {showLevelUpAnimation && <LevelUpAnimation />}
      {showAchievementAnimation && <AchievementAnimation />}
      {/* Custom CSS for animations */}{" "}
      <style jsx>
        {`
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

          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 1;
              box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
            }
            50% {
              opacity: 0.8;
              box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
            }
          }

          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default MockInterview;
