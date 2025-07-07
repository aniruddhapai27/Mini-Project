import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { studyAssistantApi } from "../utils/api";
import ReactMarkdown from "react-markdown";
import ErrorBoundary from "../components/ErrorBoundary";
import DotLottieLoader from "../components/DotLottieLoader";
import { FaTrash } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const StudyAssistant = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  // State management
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ADA");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [typewriterActive, setTypewriterActive] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [isThinking, setIsThinking] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showPagination, setShowPagination] = useState(false);

  const subjects = [
    {
      key: "ADA",
      name: "Algorithm Design & Analysis",
      icon: "🔢",
      color: "from-blue-500 to-cyan-500",
    },
    {
      key: "CN",
      name: "Computer Networks",
      icon: "🌐",
      color: "from-green-500 to-emerald-500",
    },
    {
      key: "DBMS",
      name: "Database Management",
      icon: "💾",
      color: "from-purple-500 to-violet-500",
    },
    {
      key: "OS",
      name: "Operating Systems",
      icon: "💻",
      color: "from-orange-500 to-red-500",
    },
    {
      key: "SE",
      name: "Software Engineering",
      icon: "⚙️",
      color: "from-indigo-500 to-blue-500",
    },
    {
      key: "DS",
      name: "Data Structures",
      icon: "📊",
      color: "from-pink-500 to-rose-500",
    },
  ];
  // Fetch chat history with pagination
  const fetchChatHistory = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingSessions(true);
      const response = await studyAssistantApi.getPaginatedHistory(page, limit);

      if (response.success) {
        setSessions(response.data.sessions || []);
        setCurrentPage(response.data.currentPage || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalSessions(response.data.totalSessions || 0);
        setShowPagination(response.data.totalPages > 1);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // Fallback to non-paginated version
      try {
        const fallbackResponse = await studyAssistantApi.getHistory();
        setSessions(fallbackResponse.sessions || []);
        setShowPagination(false);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to load chat history");
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !isLoadingSessions
    ) {
      fetchChatHistory(newPage, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchChatHistory(1, newSize);
  };

  // Load session messages
  const loadSessionMessages = useCallback(
    async (sessionIdToLoad) => {
      try {
        console.log("Loading session messages for ID:", sessionIdToLoad);
        setIsLoading(true);
        const response = await studyAssistantApi.getSession(sessionIdToLoad);
        console.log("Session response:", response);

        if (response && response.messages) {
          setMessages(response.messages);
          setCurrentSession(response.session);
          setSelectedSubject(response.session?.subject || "ADA");
          setActiveSessionId(sessionIdToLoad);
        } else {
          console.error("Invalid session response format:", response);
          toast.error("Invalid session data format");
        }
      } catch (error) {
        console.error("Error loading session:", error);

        // Check if it's a 404 (session not found) vs other errors
        if (error.response && error.response.status === 404) {
          toast.error("Chat session not found. Redirecting to new session...");
        } else {
          toast.error(
            "Failed to load chat session: " + (error.message || "Unknown error")
          );
        }

        // If the session doesn't exist or can't be loaded, redirect to new session after a brief delay
        setTimeout(() => {
          navigate("/study-assistant/new", { replace: true });
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  ); // Create new chat session
  const createNewSession = useCallback(
    async (subject = selectedSubject) => {
      try {
        console.log("Starting new session for subject:", subject);

        // Don't create session immediately - just reset state and navigate
        const newSessionUrl = `/study-assistant/new`;
        console.log("Navigating to new session URL:", newSessionUrl);

        // Update URL and navigate
        navigate(newSessionUrl, { replace: true });

        // Reset current state - no session created yet
        setCurrentSession(null);
        setMessages([]);
        setSelectedSubject(subject);
        setActiveSessionId(null);

        return "new"; // Return 'new' as placeholder
      } catch (error) {
        console.error("Error setting up new session:", error);
        toast.error(
          "Failed to start new chat session: " +
            (error.message || "Unknown error")
        );
        throw error;
      }
    },
    [navigate, selectedSubject]
  ); // Send message
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message immediately
    const userMessageObj = {
      type: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessageObj]);

    try {
      setIsLoading(true);
      setIsThinking(true);
      setTypewriterActive(false);
      setTypewriterText("");

      // Add thinking message
      const thinkingMessageObj = {
        type: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isThinking: true,
      };
      setMessages((prev) => [...prev, thinkingMessageObj]);

      console.log("Processing message:", userMessage);

      // Determine session ID - create session only when user sends first message
      let sessionIdToUse = currentSession?._id || sessionId;
      console.log("Current session ID:", sessionIdToUse);

      // If no session exists or it's 'new', create a new session with this first message
      if (!sessionIdToUse || sessionIdToUse === "new") {
        console.log("Creating new session with first user message");

        // Send message to API without session_id - this will create a new session
        const response = await studyAssistantApi.sendMessage({
          user_query: userMessage,
          subject: selectedSubject,
          session_id: null, // null will trigger session creation
        });

        // Update the session state with the new session ID
        const newSessionId = response.session_id;
        console.log("New session created with ID:", newSessionId);

        setCurrentSession({ _id: newSessionId, subject: selectedSubject });
        setActiveSessionId(newSessionId);

        // Update URL to reflect the new session
        navigate(`/study-assistant/${newSessionId}`, { replace: true });

        // Refresh sessions list to include the new session at the top (page 1)
        // Reset to page 1 and refresh to ensure the new session appears at the top
        setCurrentPage(1);
        await fetchChatHistory(1, pageSize);

        // Replace thinking message with AI response with typewriter effect
        setIsThinking(false);
        setTypewriterText(response.response);
        setTypewriterActive(true);
        setMessages((prev) => {
          const newMsgs = [...prev];
          const thinkingIndex = newMsgs.findIndex((m) => m.isThinking);
          if (thinkingIndex !== -1) {
            newMsgs[thinkingIndex] = {
              type: "assistant",
              content: "",
              timestamp: new Date().toISOString(),
              isTypewriter: true,
            };
          }
          return newMsgs;
        });
      } else {
        // Session already exists, continue the conversation
        console.log("Continuing existing session:", sessionIdToUse);

        const response = await studyAssistantApi.sendMessage({
          user_query: userMessage,
          subject: selectedSubject,
          session_id: sessionIdToUse,
        });

        // Add AI response with typewriter effect
        setIsThinking(false);
        setTypewriterText(response.response);
        setTypewriterActive(true);
        setMessages((prev) => {
          const newMsgs = [...prev];
          const thinkingIndex = newMsgs.findIndex((m) => m.isThinking);
          if (thinkingIndex !== -1) {
            newMsgs[thinkingIndex] = {
              type: "assistant",
              content: "",
              timestamp: new Date().toISOString(),
              isTypewriter: true,
            };
          }
          return newMsgs;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");

      // Remove user message and thinking message on error
      setMessages((prev) => prev.slice(0, -2));
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    isLoading,
    currentSession,
    sessionId,
    selectedSubject,
    navigate,
    fetchChatHistory,
    pageSize,
  ]);

  // Typewriter effect for last assistant message
  useEffect(() => {
    if (!typewriterActive || !typewriterText) return;
    let idx = messages.findIndex((m) => m.isTypewriter);
    if (idx === -1) return;
    let i = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const newMsgs = [...prev];
        if (newMsgs[idx]) newMsgs[idx].content = typewriterText.slice(0, i + 1);
        return newMsgs;
      });
      i++;
      if (i >= typewriterText.length) {
        clearInterval(interval);
        setTypewriterActive(false);
        setTypewriterText("");
        setMessages((prev) => prev.map((m) => ({ ...m, isTypewriter: false })));
      }
    }, 3);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [typewriterActive, typewriterText]);

  // Initialize component
  useEffect(() => {
    fetchChatHistory(1, pageSize);

    // Load specific session if sessionId provided
    if (sessionId && sessionId !== "new") {
      loadSessionMessages(sessionId);
    }
  }, [sessionId, loadSessionMessages, fetchChatHistory, pageSize]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Get subject info
  const getSubjectInfo = (key) =>
    subjects.find((s) => s.key === key) || subjects[0];

  // Format date helper function
  const formatSessionDate = (session) => {
    // Use the date field sent from backend, with fallback to other fields
    const date =
      session.date ||
      session.lastActivity ||
      session.updatedAt ||
      session.createdAt ||
      session.created_at ||
      session.updated_at;

    if (!date) {
      console.warn("No date found in session:", session);
      return "No date available";
    }

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date format:", date);
        return "Invalid date";
      }

      return dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date);
      return "Invalid date";
    }
  };

  // Show loading screen when initially loading a session
  if (isLoading && !currentSession && sessionId && sessionId !== "new") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <DotLottieLoader
          size="w-20 h-20"
          text="Loading chat session..."
          textSize="text-lg"
          textColor="text-white"
        />
      </div>
    );
  }

  const handleDeleteSession = async (sessionIdToDelete) => {
    try {
      setDeletingSessionId(sessionIdToDelete);
      await studyAssistantApi.deleteSession(sessionIdToDelete);
      toast.success("Session deleted");

      // Refresh pagination data instead of just local filtering
      const currentSessionsCount = sessions.length;
      const isLastSessionOnPage = currentSessionsCount === 1 && currentPage > 1;

      // If we're deleting the last session on a page that's not page 1, go to previous page
      if (isLastSessionOnPage) {
        fetchChatHistory(currentPage - 1, pageSize);
      } else {
        // Otherwise refresh current page
        fetchChatHistory(currentPage, pageSize);
      }

      // If current session is deleted, go to new
      if (activeSessionId === sessionIdToDelete) {
        navigate("/study-assistant/new", { replace: true });
        setCurrentSession(null);
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-black relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="study-grid"
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
            <rect width="100%" height="100%" fill="url(#study-grid)" />
          </svg>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-0 z-30 p-3 bg-cyan-600 text-white rounded-r-lg md:hidden shadow-lg"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        )}
      </button>

      {/* Sidebar - Fixed */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 fixed top-16 bottom-0 left-0 z-20 flex flex-col h-[calc(100vh-4rem)] overflow-x-hidden"
          >
            {/* Fixed Sidebar Header - Subject Selection */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Study Assistant
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Subject Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const newSubject = e.target.value;
                    if (newSubject !== selectedSubject) {
                      setSelectedSubject(newSubject);
                      // Automatically create a new chat session for the new subject
                      createNewSession(newSubject);
                    }
                  }}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {subjects.map((subject) => (
                    <option key={subject.key} value={subject.key}>
                      {subject.icon} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Chat Button */}
              <button
                onClick={() => createNewSession()}
                className="w-full p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New Chat</span>
                </div>
              </button>
            </div>

            {/* Scrollable Chat History */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                  Recent Chats
                </h3>

                {isLoadingSessions ? (
                  <div className="flex justify-center py-8">
                    <DotLottieLoader
                      size="w-12 h-12"
                      text="Loading sessions..."
                      textSize="text-xs"
                    />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.414L3 21l2.414-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No chat history yet</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Start a new conversation
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="space-y-2">
                    <AnimatePresence>
                      {sessions.map((session) => {
                        const subjectInfo = getSubjectInfo(session.subject);
                        const isActive = activeSessionId === session._id;

                        return (
                          <motion.div
                            key={session._id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: "-100%" }}
                            transition={{ duration: 0.3 }}
                            className="relative group"
                          >
                            <div
                              onClick={() => {
                                if (!isActive) {
                                  navigate(`/study-assistant/${session._id}`);
                                }
                              }}
                              className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 cursor-pointer ${
                                isActive
                                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ring-2 ring-cyan-400/40"
                                  : "bg-gray-800/30 hover:bg-gray-800/50 border border-transparent"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-r ${subjectInfo.color} flex items-center justify-center text-sm`}
                              >
                                {subjectInfo.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {subjectInfo.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {formatSessionDate(session)}
                                </p>
                              </div>
                              <button
                                className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete session"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session._id);
                                }}
                                disabled={deletingSessionId === session._id}
                              >
                                {deletingSessionId === session._id ? (
                                  <DotLottieLoader size="w-4 h-4" />
                                ) : (
                                  <FaTrash size={14} />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Pagination Controls */}
                {showPagination && (
                  <div className="mt-4 space-y-3">
                    {/* Page Size Selector */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Show:</span>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            handlePageSizeChange(parseInt(e.target.value))
                          }
                          className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                          disabled={isLoadingSessions}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                        </select>
                        <span className="text-xs text-gray-500">per page</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {totalSessions} sessions
                      </div>
                    </div>

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-1">
                          {/* Previous Page Button */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoadingSessions}
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                              currentPage === 1 || isLoadingSessions
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                            }`}
                            title="Previous page"
                          >
                            ‹
                          </button>

                          {/* Page Numbers */}
                          {(() => {
                            const pages = [];
                            const showPages = Math.min(5, totalPages);
                            let startPage = Math.max(
                              1,
                              currentPage - Math.floor(showPages / 2)
                            );
                            let endPage = Math.min(
                              totalPages,
                              startPage + showPages - 1
                            );

                            if (endPage - startPage + 1 < showPages) {
                              startPage = Math.max(1, endPage - showPages + 1);
                            }

                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => handlePageChange(i)}
                                  disabled={isLoadingSessions}
                                  className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                                    i === currentPage
                                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                  } ${
                                    isLoadingSessions
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  }`}
                                >
                                  {i}
                                </button>
                              );
                            }
                            return pages;
                          })()}

                          {/* Next Page Button */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={
                              currentPage === totalPages || isLoadingSessions
                            }
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                              currentPage === totalPages || isLoadingSessions
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                            }`}
                            title="Next page"
                          >
                            ›
                          </button>
                        </div>

                        {/* Page Info */}
                        <div className="text-xs text-gray-500 text-center">
                          Page {currentPage} of {totalPages}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header for Main Content */}
      <div
        className={`fixed transition-all duration-300 ${
          isSidebarOpen ? "md:left-80" : "left-0"
        } right-0 top-16 z-10 bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 p-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                getSubjectInfo(selectedSubject).color
              } flex items-center justify-center`}
            >
              {getSubjectInfo(selectedSubject).icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {getSubjectInfo(selectedSubject).name}
              </h1>
              <p className="text-sm text-gray-400">AI Study Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">AI Assistant</span>
        </div>
      </div>

      {/* Main Content Area - Fixed positioning */}
      <div
        className={`fixed transition-all duration-300 ${
          isSidebarOpen ? "md:left-80" : "left-0"
        } right-0 top-32 bottom-20 overflow-hidden`}
      >
        {/* Scrollable Messages Area */}
        <AnimatePresence>
          <motion.div
            key={sessionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto custom-scrollbar p-6 space-y-4"
          >
            {messages.length === 0 && !currentSession ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.414L3 21l2.414-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Welcome to Study Assistant
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Ask me anything about {getSubjectInfo(selectedSubject).name}
                    . I'm here to help you learn!
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="bg-gray-800/30 rounded-lg p-3 text-left">
                      <p className="text-gray-300">
                        💡 Try asking: "Explain binary search algorithm"
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3 text-left">
                      <p className="text-gray-300">
                        🔍 Or: "What are the types of database normalization?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start space-x-4 ${
                      message.type === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                        message.type === "assistant"
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                    >
                      {message.type === "assistant" ? (
                        "🤖"
                      ) : _user?.profilePic ? (
                        <img
                          src={_user.profilePic}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>

                    <div
                      className={`flex-1 max-w-[70%] ${
                        message.type === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl backdrop-blur-sm ${
                          message.type === "assistant"
                            ? "bg-gray-800/50 border border-gray-700/50 text-white"
                            : "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white"
                        }`}
                      >
                        {message.type === "assistant" ? (
                          <ErrorBoundary fallbackMessage="Error rendering AI response">
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
                              <div className="markdown-content leading-relaxed prose prose-invert prose-sm max-w-none">
                                {message.content &&
                                typeof message.content === "string" ? (
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children, ...props }) => (
                                        <p
                                          className="mb-2 last:mb-0"
                                          {...props}
                                        >
                                          {children}
                                        </p>
                                      ),
                                      code: ({ inline, children, ...props }) =>
                                        inline ? (
                                          <code
                                            className="bg-gray-700/50 px-1 py-0.5 rounded text-cyan-300"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        ) : (
                                          <code
                                            className="block bg-gray-700/50 p-2 rounded-md text-green-300 overflow-x-auto"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        ),
                                      pre: ({ children, ...props }) => (
                                        <pre
                                          className="bg-gray-700/50 p-2 rounded-md overflow-x-auto"
                                          {...props}
                                        >
                                          {children}
                                        </pre>
                                      ),
                                      ul: ({ children, ...props }) => (
                                        <ul
                                          className="list-disc list-inside mb-2"
                                          {...props}
                                        >
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children, ...props }) => (
                                        <ol
                                          className="list-decimal list-inside mb-2"
                                          {...props}
                                        >
                                          {children}
                                        </ol>
                                      ),
                                      li: ({ children, ...props }) => (
                                        <li className="mb-1" {...props}>
                                          {children}
                                        </li>
                                      ),
                                      h1: ({ children, ...props }) => (
                                        <h1
                                          className="text-lg font-bold mb-2 text-cyan-300"
                                          {...props}
                                        >
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children, ...props }) => (
                                        <h2
                                          className="text-base font-semibold mb-2 text-cyan-300"
                                          {...props}
                                        >
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children, ...props }) => (
                                        <h3
                                          className="text-sm font-semibold mb-1 text-cyan-300"
                                          {...props}
                                        >
                                          {children}
                                        </h3>
                                      ),
                                      strong: ({ children, ...props }) => (
                                        <strong
                                          className="font-semibold text-white"
                                          {...props}
                                        >
                                          {children}
                                        </strong>
                                      ),
                                      em: ({ children, ...props }) => (
                                        <em
                                          className="italic text-gray-300"
                                          {...props}
                                        >
                                          {children}
                                        </em>
                                      ),
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                ) : (
                                  <p>Received non-string content.</p>
                                )}
                                {message.isTypewriter && typewriterActive && (
                                  <DotLottieLoader
                                    size="w-3 h-3"
                                    className="inline-block ml-1 align-middle"
                                  />
                                )}
                              </div>
                            )}
                          </ErrorBoundary>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div
        className={`fixed transition-all duration-300 ${
          isSidebarOpen ? "md:left-80" : "left-0"
        } right-0 bottom-0 p-4 bg-gray-900/50 backdrop-blur-xl border-t border-gray-700/50`}
      >
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full p-4 pr-16 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: "52px" }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <DotLottieLoader size="w-5 h-5" />
            ) : (
              <svg
                className="w-5 h-5"
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
      </div>
    </motion.div>
  );
};

export default StudyAssistant;
