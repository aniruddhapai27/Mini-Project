import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
  endInterviewWithFeedback,
  getInterviewFeedback,
  selectFeedbackLoading,
  selectInterviewEndLoading,
  addUserMessage,
  addAIMessage,
} from "../redux/slices/interviewSlice";
import DotLottieLoader from "../components/DotLottieLoader";
import VoiceRecorder from "../components/VoiceRecorder";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  playTextToSpeech,
  stopAudio,
  isTextToSpeechSupported,
} from "../utils/textToSpeech";

const MockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sessionId: urlSessionId } = useParams(); // Get sessionId from URL params
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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
  const feedbackLoading = useSelector(selectFeedbackLoading);
  const interviewEndLoading = useSelector(selectInterviewEndLoading);

  // Animation states
  const showStreakAnimation = useSelector(selectShowStreakAnimation);
  const showLevelUpAnimation = useSelector(selectShowLevelUpAnimation);
  const showAchievementAnimation = useSelector(selectShowAchievementAnimation);

  // Local state
  const [showEndModal, setShowEndModal] = useState(false);
  const [typewriterActive, setTypewriterActive] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [currentTypewriterText, setCurrentTypewriterText] = useState("");
  const [typewriterMessageIndex, setTypewriterMessageIndex] = useState(-1);
  const [lastProcessedMessageCount, setLastProcessedMessageCount] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isInterviewEnding, setIsInterviewEnding] = useState(false);

  // Text-to-speech state
  const [currentAudio, setCurrentAudio] = useState(null);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [preloadedAudio, setPreloadedAudio] = useState(null);

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

  // Text-to-speech functions
  const preloadTextToSpeech = useCallback(
    async (text) => {
      if (!ttsSupported || !text) return null;

      try {
        console.log("🔊 Preloading TTS audio...");
        const audio = await playTextToSpeech(
          text,
          "Aaliyah-PlayAI", // Default voice
          null, // No onStart callback during preload
          null, // No onEnd callback during preload
          (error) => {
            console.error("Audio preload error:", error);
          },
          true // preloadOnly = true
        );

        console.log("✅ TTS audio preloaded successfully");
        return audio;
      } catch (error) {
        console.error("Failed to preload text-to-speech:", error);
        return null;
      }
    },
    [ttsSupported]
  );

  const handlePlayTextToSpeech = useCallback(
    async (text, usePreloaded = false) => {
      try {
        // Stop any currently playing audio
        if (currentAudio) {
          stopAudio(currentAudio);
          setCurrentAudio(null);
        }

        let audio;
        if (usePreloaded && preloadedAudio) {
          // Use preloaded audio
          audio = preloadedAudio;
          setPreloadedAudio(null); // Clear preloaded audio after use
          console.log("🔊 Using preloaded audio");
        } else {
          // Load audio fresh
          audio = await playTextToSpeech(
            text,
            "Aaliyah-PlayAI", // Default voice
            () => {
              // On start
              console.log("Audio started playing");
            },
            () => {
              // On end
              setCurrentAudio(null);
            },
            (error) => {
              // On error
              console.error("Audio playback error:", error);
              setCurrentAudio(null);
            }
          );
        }

        // Set up event listeners for preloaded audio
        if (usePreloaded) {
          audio.addEventListener("ended", () => {
            setCurrentAudio(null);
          });
          audio.addEventListener("error", (error) => {
            console.error("Audio playback error:", error);
            setCurrentAudio(null);
          });
        }

        // Play the audio
        await audio.play();
        setCurrentAudio(audio);
      } catch (error) {
        console.error("Failed to play text-to-speech:", error);
        setCurrentAudio(null);
      }
    },
    [currentAudio, preloadedAudio]
  );

  // Check TTS support on component mount
  useEffect(() => {
    setTtsSupported(isTextToSpeechSupported());
  }, []);

  // Auto-play TTS functionality removed

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        stopAudio(currentAudio);
      }
      if (preloadedAudio) {
        stopAudio(preloadedAudio);
      }
    };
  }, [currentAudio, preloadedAudio]);

  // Get question limit based on difficulty
  const getQuestionLimit = useCallback((difficulty) => {
    const limits = {
      easy: 7,
      medium: 10,
      hard: 15,
    };
    return limits[difficulty] || 10;
  }, []);

  // Handle ending interview
  const handleEndInterview = useCallback(async () => {
    try {
      console.log("🔚 Ending interview...");

      if (!currentSessionId) {
        console.log("❌ No session ID found, using fallback navigation");
        // If no session ID, navigate with basic data
        navigate("/mock-interview-results", {
          state: {
            conversation,
            domain: sessionData.domain,
            difficulty: sessionData.difficulty,
            score: null, // No score without feedback
            error: "No session ID available for feedback",
          },
        });
        return;
      }

      console.log(
        "📝 Using endInterviewWithFeedback thunk for session:",
        currentSessionId
      );

      // Use the integrated Redux thunk to end interview and get feedback
      const result = await dispatch(
        endInterviewWithFeedback({
          sessionId: currentSessionId,
        })
      );

      console.log("📊 End interview with feedback result:", result);

      if (result.meta.requestStatus === "fulfilled") {
        console.log("✅ Interview ended and feedback received successfully");
        const { feedback } = result.payload;

        // Extract score directly from feedback overall_score field
        const score = feedback?.overall_score || null;

        navigate("/mock-interview-results", {
          state: {
            sessionId: currentSessionId,
            conversation,
            domain: sessionData.domain,
            difficulty: sessionData.difficulty,
            score: score, // Use overall_score directly
            feedback: feedback,
          },
        });
      } else {
        console.log("❌ End interview with feedback failed:", result.error);

        // Try to get feedback separately as fallback
        console.log("🔄 Attempting fallback feedback request...");
        const feedbackResult = await dispatch(
          getInterviewFeedback(currentSessionId)
        );

        const fallbackFeedback =
          feedbackResult.meta.requestStatus === "fulfilled"
            ? feedbackResult.payload.feedback
            : null;

        // Extract score directly from fallback feedback overall_score field
        const score = fallbackFeedback?.overall_score || null;

        navigate("/mock-interview-results", {
          state: {
            sessionId: currentSessionId,
            conversation,
            domain: sessionData.domain,
            difficulty: sessionData.difficulty,
            score: score, // Use overall_score directly
            feedback: fallbackFeedback,
            error: fallbackFeedback ? null : "Failed to generate AI feedback",
          },
        });
      }
    } catch (error) {
      console.error("❌ Failed to end interview:", error);

      // Fallback navigation without artificial score
      navigate("/mock-interview-results", {
        state: {
          conversation,
          domain: sessionData.domain,
          difficulty: sessionData.difficulty,
          score: null, // No artificial score
          error: "Failed to generate AI feedback",
        },
      });
    }
  }, [currentSessionId, navigate, conversation, sessionData, dispatch]);

  // Handle sending user response
  const handleSendResponse = useCallback(async () => {
    if (!userResponse.trim() || aiResponseLoading || isInterviewEnding) return;

    const userMessage = userResponse.trim();

    // Add user message to the conversation immediately
    dispatch(
      addUserMessage({
        message: userMessage,
        timestamp: new Date().toISOString(),
      })
    );

    // Reset user response input
    dispatch(setUserResponse(""));

    // Set thinking state
    setIsThinking(true);
    setTypewriterActive(false);
    setTypewriterText("");

    // Calculate current question number (each question-answer is 2 messages)
    const currentQuestionNumber = Math.floor(conversation.length / 2) + 1;
    const questionLimit = getQuestionLimit(sessionData.difficulty);

    // Check if we should automatically end after reaching question limit
    if (currentQuestionNumber >= questionLimit) {
      // Mark interview as ending to disable further input
      setIsInterviewEnding(true);

      // Don't send to server, just add thank you message and end interview
      setTimeout(() => {
        console.log(
          `🏁 Interview completed - reached ${questionLimit} questions limit`
        );

        // Add a thank you message from AI without server call
        dispatch(
          addAIMessage(
            "Thank you for participating in this interview! You've completed all the questions. I'll now analyze your responses and provide detailed feedback on your performance. Great job!"
          )
        );

        // End the interview after a short delay to show the thank you message
        setTimeout(() => {
          handleEndInterview();
        }, 3000); // Give time for the thank you message to be displayed
      }, 1000); // Short delay to show the user message first

      return; // Exit early, don't send to server
    }

    // Create message data for the API (only if not at question limit)
    const messageData = {
      domain: sessionData.domain,
      difficulty: sessionData.difficulty,
      useResume: sessionData.useResume !== undefined ? sessionData.useResume : true, // Include useResume flag with default to true
      userResponse: userMessage,
      sessionId: currentSessionId,
    };

    // Now dispatch the API call to get AI's response
    dispatch(sendInterviewMessage(messageData));
  }, [
    userResponse,
    aiResponseLoading,
    isInterviewEnding,
    sessionData,
    currentSessionId,
    conversation,
    dispatch,
    getQuestionLimit,
    handleEndInterview,
  ]);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback(
    (transcriptText) => {
      if (transcriptText && transcriptText.trim()) {
        // Set the transcribed text in the input field
        dispatch(setUserResponse(transcriptText.trim()));

        // Focus the textarea so user can see the text and edit if needed
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at the end of the text
          setTimeout(() => {
            const textarea = textareaRef.current;
            if (textarea) {
              textarea.setSelectionRange(
                textarea.value.length,
                textarea.value.length
              );
            }
          }, 0);
        }
      }
    },
    [dispatch]
  );

  // Handle voice recording error
  const handleVoiceError = useCallback((error) => {
    console.error("Voice recording error:", error);
    // You could add a toast notification here if needed
  }, []);

  // Handle starting the interview
  const handleStartInterview = async () => {
    dispatch(startInterview());

    setIsThinking(true);

    // Check if we should use existing session ID from URL (if it's not 'new')
    const shouldUseExistingSession = urlSessionId && urlSessionId !== "new";
    const sessionIdToUse = shouldUseExistingSession ? urlSessionId : null;

    console.log(
      `Starting interview with ${
        shouldUseExistingSession ? "existing" : "new"
      } session ID: ${sessionIdToUse || "null"}`
    );

    // For the first question, we don't need to add a welcome message manually
    // We'll send an initial message to the API to get the first question
    const initialMessageData = {
      domain: sessionData.domain,
      difficulty: sessionData.difficulty,
      useResume: sessionData.useResume !== undefined ? sessionData.useResume : true, // Include useResume flag with default to true
      userResponse:
        "Hello, I'm ready to start the interview. Please begin with your first question.",
      sessionId: sessionIdToUse, // Use existing session ID or null for a new one
    };

    dispatch(sendInterviewMessage(initialMessageData));
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, aiResponseLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      // Reset height to calculate scroll height properly
      textarea.style.height = "52px";

      // Calculate the required height based on content
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      const minHeight = 52;

      // Set height to content height, but within bounds
      if (scrollHeight > minHeight) {
        textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
      }
    }
  }, [userResponse]);

  // Handle keyboard shortcuts - Enter key to send, Shift+Enter for new line
  const handleKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !aiResponseLoading &&
      !isInterviewEnding
    ) {
      e.preventDefault();
      if (userResponse.trim()) {
        handleSendResponse();
      }
    }
  };

  // Using the already defined state variables above

  // Typewriter effect for last assistant message
  useEffect(() => {
    if (!typewriterActive || !typewriterText) return;

    let i = 0;
    const interval = setInterval(() => {
      // Update the displayed text with one more character
      setCurrentTypewriterText(typewriterText.slice(0, i + 1));

      i++;
      if (i >= typewriterText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTypewriterActive(false);
          setTypewriterMessageIndex(-1);

          // Auto-play TTS when typewriter effect is complete
          if (ttsSupported && typewriterMessageIndex !== -1) {
            setTimeout(() => {
              handlePlayTextToSpeech(typewriterText, true); // Use preloaded audio
            }, 500); // Small delay after typewriter completes
          }
        }, 500); // Keep the completed message for a moment before removing the cursor
      }
    }, 5); // Fast typing speed

    return () => clearInterval(interval);
  }, [
    typewriterActive,
    typewriterText,
    ttsSupported,
    typewriterMessageIndex,
    handlePlayTextToSpeech,
  ]);

  // Trigger typewriter effect for new AI messages only
  useEffect(() => {
    // Only process if we're not loading and not thinking (i.e., we have received a response)
    if (!aiResponseLoading && isThinking) {
      // AI has finished responding
      setIsThinking(false);
    }

    if (!aiResponseLoading && !isThinking) {
      // Check if we have more messages than before and the last message is from AI
      const currentMessageCount = conversation.length;
      const lastMessage = conversation[currentMessageCount - 1];

      if (
        currentMessageCount > lastProcessedMessageCount &&
        lastMessage &&
        (lastMessage.type === "ai" || lastMessage.type === "assistant")
      ) {
        // This is a new AI message, set up typewriter effect
        const messageContent = lastMessage.message;
        const actualIndex = currentMessageCount - 1;

        if (messageContent) {
          setTypewriterText(messageContent);
          setCurrentTypewriterText(""); // Start with empty text
          setTypewriterMessageIndex(actualIndex); // Track which message gets the typewriter
          setTypewriterActive(true);

          // Preload TTS audio while typewriter effect is running
          if (ttsSupported && messageContent) {
            preloadTextToSpeech(messageContent).then((audio) => {
              if (audio) {
                setPreloadedAudio(audio);
                console.log(
                  "🔊 Audio preloaded and ready for typewriter completion"
                );
              }
            });
          }
        }

        // Update the processed message count
        setLastProcessedMessageCount(currentMessageCount);
      } else if (currentMessageCount !== lastProcessedMessageCount) {
        // Update count for non-AI messages too (user messages)
        setLastProcessedMessageCount(currentMessageCount);
      }
    }
  }, [
    aiResponseLoading,
    conversation,
    isThinking,
    ttsSupported,
    preloadTextToSpeech,
    lastProcessedMessageCount,
  ]);

  // Update URL when sessionId changes
  useEffect(() => {
    // Only update the URL if we have a valid session ID that's different from the URL
    if (
      currentSessionId &&
      urlSessionId !== currentSessionId &&
      urlSessionId === "new"
    ) {
      // Update URL without navigating away or triggering a re-render
      window.history.replaceState(
        null,
        "",
        `/mock-interview/${currentSessionId}`
      );
      console.log(`Updated URL with session ID: ${currentSessionId}`);
    }
  }, [currentSessionId, urlSessionId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetInterview());
      setIsInterviewEnding(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-black flex flex-col relative overflow-hidden pt-0"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="interview-grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="cyan"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#interview-grid)" />
          </svg>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-0 h-full overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 p-2 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm sm:text-base">
                {getDomainIcon(sessionData.domain)}
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white">
                  {formatDomainName(sessionData.domain)}{" "}
                  <span className="hidden sm:inline">Interview</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  <span className="capitalize">
                    {sessionData.difficulty} Level
                  </span>
                  {conversation.length > 0 && (
                    <span className="ml-2">
                      • Q{Math.floor(conversation.length / 2) + 1}/
                      {getQuestionLimit(sessionData.difficulty)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {interviewStarted && (
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-400">Progress</div>
                <div className="text-white text-sm sm:text-lg font-bold">
                  {Math.floor(conversation.length / 2)}/
                  {getQuestionLimit(sessionData.difficulty)}
                </div>
              </div>
            )}
            {interviewStarted && (
              <button
                onClick={() => setShowEndModal(true)}
                disabled={feedbackLoading}
                className={`py-1 px-2 sm:py-2 sm:px-4 rounded-lg transition-all duration-300 text-xs sm:text-sm border ${
                  feedbackLoading
                    ? "bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed"
                    : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                }`}
              >
                {feedbackLoading ? (
                  "Processing..."
                ) : (
                  <span>
                    <span className="sm:hidden">End</span>
                    <span className="hidden sm:inline">End Interview</span>
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-6"
            ref={chatContainerRef}
            style={{
              height: "calc(100vh - 160px)",
              scrollBehavior: "smooth",
            }}
          >
            {!interviewStarted ? (
              /* Interview Introduction */
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-3xl mx-auto p-4 sm:p-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl animate-pulse">
                    {getDomainIcon(sessionData.domain)}
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      AI Interview System
                    </span>
                  </h2>
                  <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                    Ready for your personalized{" "}
                    <span className="text-cyan-400 font-semibold">
                      {formatDomainName(sessionData.domain)}
                    </span>{" "}
                    interview experience at{" "}
                    <span className="text-purple-400 font-semibold capitalize">
                      {sessionData.difficulty}
                    </span>{" "}
                    level.
                    <br />
                    <span className="text-yellow-400 font-medium">
                      You'll answer {getQuestionLimit(sessionData.difficulty)}{" "}
                      questions for {sessionData.difficulty} level
                    </span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
                    <div className="bg-gray-800/30 rounded-lg p-4 sm:p-5 text-center">
                      <div className="text-xl sm:text-2xl mb-2 sm:mb-3 animate-bounce">
                        🎯
                      </div>
                      <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                        Be Specific
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Provide detailed answers with concrete examples
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4 sm:p-5 text-center">
                      <div
                        className="text-xl sm:text-2xl mb-2 sm:mb-3 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        💭
                      </div>
                      <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                        Think Aloud
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Share your thought process and reasoning
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4 sm:p-5 text-center">
                      <div
                        className="text-xl sm:text-2xl mb-2 sm:mb-3 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      >
                        ⌨️
                      </div>
                      <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                        Quick Send
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Press Enter to send responses quickly
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    className="py-2 px-6 sm:py-3 sm:px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold text-base sm:text-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Start Interview</span>
                      <span>🚀</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {conversation.map((message, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      duration: 0.3,
                      // Add a slight delay for AI messages to create a natural conversation flow
                      delay:
                        message.type === "ai" || message.type === "assistant"
                          ? 0.1
                          : 0,
                    }}
                    className={`flex items-start space-x-3 sm:space-x-4 ${
                      message.type === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    } mb-4`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base ${
                        message.type === "ai" || message.type === "assistant"
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                    >
                      {message.type === "ai" || message.type === "assistant"
                        ? "🤖"
                        : "👤"}
                    </div>

                    <div
                      className={`flex-1 max-w-[85%] sm:max-w-[70%] ${
                        message.type === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`p-4 sm:p-5 rounded-2xl backdrop-blur-sm shadow-lg ${
                          message.type === "ai" || message.type === "assistant"
                            ? "bg-gray-800/60 border border-gray-700/60 text-white"
                            : "bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/40 text-white"
                        }`}
                      >
                        <ErrorBoundary fallbackMessage="Error rendering message">
                          {message.isThinking ? (
                            <div className="flex items-center justify-center py-2">
                              <DotLottieLoader
                                size="w-8 h-8"
                                text="Assistant is thinking..."
                                textSize="text-sm"
                                layout="horizontal"
                              />
                            </div>
                          ) : (
                            <div className="leading-relaxed">
                              <p className="text-sm sm:text-base">
                                {typewriterActive &&
                                typewriterMessageIndex === index ? (
                                  <span className="animate-typing">
                                    {currentTypewriterText}
                                  </span>
                                ) : message.message &&
                                  typeof message.message === "string" ? (
                                  message.message
                                ) : typeof message.message === "object" ? (
                                  JSON.stringify(message.message)
                                ) : (
                                  "No message content"
                                )}
                                {typewriterActive &&
                                  typewriterMessageIndex === index && (
                                    <DotLottieLoader
                                      size="w-3 h-3"
                                      className="inline-block ml-1 align-middle text-cyan-400"
                                    />
                                  )}
                              </p>

                              {/* Removed TTS Button - Auto-play enabled */}
                            </div>
                          )}
                        </ErrorBoundary>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {message.timestamp
                          ? typeof message.timestamp === "object" &&
                            message.timestamp instanceof Date
                            ? message.timestamp.toLocaleTimeString()
                            : new Date(message.timestamp).toLocaleTimeString()
                          : new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* AI Typing Indicator */}
                {aiResponseLoading && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start space-x-2 sm:space-x-4"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse text-sm sm:text-base">
                      🤖
                    </div>

                    <div className="flex-1 max-w-[85%] sm:max-w-[70%]">
                      <div className="p-3 sm:p-4 rounded-2xl backdrop-blur-sm bg-gray-800/50 border border-gray-700/50 border-l-cyan-500/50 border-l-2 typing-indicator">
                        <div className="flex items-center space-x-2">
                          <DotLottieLoader
                            size="w-5 h-5 sm:w-6 sm:h-6"
                            text="AI is typing..."
                            textSize="text-xs sm:text-sm"
                            textColor="text-cyan-300"
                            layout="horizontal"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </AnimatePresence>

        {/* Input Area */}
        {interviewStarted && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 sticky bottom-0 left-0 right-0 z-30">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-end gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={userResponse}
                    onChange={(e) => dispatch(setUserResponse(e.target.value))}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isInterviewEnding
                        ? "Interview is ending... Please wait for results."
                        : "Type your response here or use voice recording..."
                    }
                    className="w-full px-4 py-3 pr-14 sm:pr-16 bg-gray-800/90 border border-gray-600/80 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none text-sm sm:text-base placeholder-gray-400 shadow-lg transition-all duration-200 custom-scrollbar"
                    rows={1}
                    style={{
                      height: "52px",
                      maxHeight: "120px",
                      lineHeight: "1.5",
                      overflow: "auto",
                    }}
                    disabled={aiResponseLoading || isInterviewEnding}
                  />

                  {/* Voice Recorder Button - Inside textarea */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                    <VoiceRecorder
                      onTranscript={handleVoiceTranscript}
                      onError={handleVoiceError}
                      disabled={aiResponseLoading || isInterviewEnding}
                      size="w-7 h-7 sm:w-8 sm:h-8"
                      className="bg-gray-700/80 hover:bg-gray-600/80 rounded-lg p-1.5 transition-all duration-200 shadow-md"
                    />
                  </div>
                </div>

                {/* Send Button - Outside textarea */}
                <button
                  onClick={handleSendResponse}
                  disabled={
                    !userResponse.trim() ||
                    aiResponseLoading ||
                    isInterviewEnding
                  }
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center"
                  title={aiResponseLoading ? "Sending..." : "Send message"}
                >
                  {aiResponseLoading ? (
                    <DotLottieLoader size="w-5 h-5" />
                  ) : (
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Helper Text */}
              <div className="flex justify-center mt-3 text-xs text-gray-400/80">
                <span className="hidden sm:inline text-center">
                  Press{" "}
                  <kbd className="px-2 py-1 bg-gray-800/60 border border-gray-600/60 rounded text-xs mx-1">
                    Enter
                  </kbd>{" "}
                  to send •{" "}
                  <kbd className="px-2 py-1 bg-gray-800/60 border border-gray-600/60 rounded text-xs mx-1">
                    Shift+Enter
                  </kbd>{" "}
                  for new line •{" "}
                  <span className="inline-flex items-center mx-1">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    </svg>
                    use voice
                  </span>
                </span>
                <span className="sm:hidden text-center">
                  Tap Enter to send • Use voice recording
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                End Interview Session?
              </h3>
              <p className="text-gray-300 text-sm">
                Are you sure you want to end this interview? You'll receive
                detailed feedback and scoring.
              </p>
            </div>

            <div className="flex space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowEndModal(false)}
                disabled={feedbackLoading || interviewEndLoading}
                className="flex-1 py-2 px-3 sm:py-3 sm:px-4 bg-gray-800/70 text-white rounded-lg hover:bg-gray-800/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Continue
              </button>
              <button
                onClick={handleEndInterview}
                disabled={feedbackLoading || interviewEndLoading}
                className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                  feedbackLoading || interviewEndLoading
                    ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                }`}
              >
                {feedbackLoading || interviewEndLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <DotLottieLoader size="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {interviewEndLoading
                        ? "Ending Interview..."
                        : "Analyzing..."}
                    </span>
                  </div>
                ) : (
                  "End Interview"
                )}
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
      <style>{`
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

        /* Custom scrollbar for textarea */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.6) rgba(55, 65, 81, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.6);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(96, 165, 250, 0.8);
        }
      `}</style>
    </motion.div>
  );
};

export default MockInterview;
