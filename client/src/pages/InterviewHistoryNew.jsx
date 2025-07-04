import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  fetchInterviewHistory,
  getInterviewSession,
  getInterviewFeedback,
  selectInterviewHistory,
  selectHistoryLoading,
  selectHistoryTotalPages,
  selectHistoryCurrentPage,
} from "../redux/slices/interviewSlice";
import { motion, AnimatePresence } from "framer-motion";

const InterviewHistory = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // UI state
  const [activeSessionId, setActiveSessionId] = useState(sessionId || null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redux selectors
  const interviews = useSelector(selectInterviewHistory);
  const loading = useSelector(selectHistoryLoading);
  const totalPages = useSelector(selectHistoryTotalPages);
  const currentPage = useSelector(selectHistoryCurrentPage);

  // Fetch interviews on component mount
  useEffect(() => {
    dispatch(fetchInterviewHistory({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  // Fetch session details if sessionId is provided or selected
  useEffect(() => {
    const fetchSessionData = async (id) => {
      try {
        setActiveSessionId(id);

        // Fetch session data
        const sessionResult = await dispatch(getInterviewSession(id)).unwrap();
        setSelectedInterview(sessionResult);

        // Convert QnA to conversation format
        if (sessionResult.QnA && sessionResult.QnA.length > 0) {
          const formattedConversation = sessionResult.QnA.flatMap((item) => [
            { type: "ai", message: item.bot, timestamp: item.createdAt },
            { type: "user", message: item.user, timestamp: item.createdAt },
          ]);
          setConversation(formattedConversation);
        }

        // Fetch feedback if available
        if (sessionResult) {
          const feedbackResult = await dispatch(
            getInterviewFeedback(id)
          ).unwrap();
          if (feedbackResult && feedbackResult.feedback) {
            setFeedback(feedbackResult.feedback);
          } else if (sessionResult.feedBack) {
            setFeedback(sessionResult.feedBack);
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        toast.error("Failed to load interview session");
      }
    };

    if (sessionId) {
      fetchSessionData(sessionId);
    } else if (activeSessionId) {
      fetchSessionData(activeSessionId);
    } else if (interviews && interviews.length > 0 && !activeSessionId) {
      fetchSessionData(interviews[0]._id);
    }
  }, [dispatch, sessionId, interviews, activeSessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(fetchInterviewHistory({ page, limit: 10 }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = () => {
    if (!selectedInterview) return null;

    return (
      <>
        {/* Conversation Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            Interview Conversation
          </h2>

          <div className="space-y-4">
            {conversation.length > 0 ? (
              conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      message.type === "ai"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-500"
                    }`}
                  >
                    {message.type === "ai" ? "🤖" : "👤"}
                  </div>

                  <div
                    className={`flex-1 max-w-[70%] ${
                      message.type === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl backdrop-blur-sm ${
                        message.type === "ai"
                          ? "bg-gray-800/50 border border-gray-700/50 text-white"
                          : "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white"
                      }`}
                    >
                      <div className="leading-relaxed">{message.message}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {message.timestamp ? formatDate(message.timestamp) : ""}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No conversation data available
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Interview Feedback
            </h2>

            <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg p-6">
              <div className="space-y-4">
                {typeof feedback === "object" ? (
                  <>
                    {feedback.overallFeedback && (
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          Overall Feedback
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                          <ReactMarkdown>
                            {feedback.overallFeedback}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {feedback.strengthPoints &&
                      feedback.strengthPoints.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-cyan-400 mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Strengths
                          </h3>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            {feedback.strengthPoints.map((point, idx) => (
                              <li key={idx} className="text-white">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {feedback.improvementPoints &&
                      feedback.improvementPoints.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-rose-400 mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            Areas for Improvement
                          </h3>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            {feedback.improvementPoints.map((point, idx) => (
                              <li key={idx} className="text-white">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {feedback.tipsSuggestions && (
                      <div>
                        <h3 className="text-lg font-medium text-amber-400 mb-2 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          Tips & Suggestions
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                          <ReactMarkdown>
                            {feedback.tipsSuggestions}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Map domain to display name and icon
  const getDomainInfo = (domain) => {
    const domains = {
      hr: {
        name: "HR Interview",
        icon: "👔",
        color: "from-blue-500 to-indigo-500",
      },
      technical: {
        name: "Technical",
        icon: "💻",
        color: "from-cyan-500 to-blue-500",
      },
      behavioral: {
        name: "Behavioral",
        icon: "🧠",
        color: "from-violet-500 to-purple-500",
      },
      leadership: {
        name: "Leadership",
        icon: "👑",
        color: "from-amber-500 to-yellow-500",
      },
      system_design: {
        name: "System Design",
        icon: "🏗️",
        color: "from-emerald-500 to-green-500",
      },
      coding: {
        name: "Coding",
        icon: "⌨️",
        color: "from-rose-500 to-red-500",
      },
      dataScience: {
        name: "Data Science",
        icon: "📊",
        color: "from-green-500 to-emerald-500",
      },
      webdev: {
        name: "Web Development",
        icon: "🌐",
        color: "from-cyan-500 to-blue-500",
      },
    };

    return (
      domains[domain] || {
        name: domain.charAt(0).toUpperCase() + domain.slice(1),
        icon: "❓",
        color: "from-gray-500 to-slate-500",
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-black flex relative overflow-hidden"
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

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-0 z-30 p-3 bg-primary text-white rounded-r-lg md:hidden shadow-lg"
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

      {/* Sidebar - Interview History List (Fixed) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 fixed top-16 bottom-0 left-0 z-20 flex flex-col h-[calc(100vh-4rem)]"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Interview History
                </h2>
                <button
                  onClick={() => navigate("/mock-interview-selection")}
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Interview List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              ) : interviews.length === 0 ? (
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
                  <p className="text-gray-500 text-sm">
                    No interview history yet
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Start a new interview
                  </p>
                </div>
              ) : (
                <motion.div layout className="space-y-2">
                  <AnimatePresence>
                    {" "}
                    {interviews.map((interview) => {
                      const domainInfo = getDomainInfo(interview.domain);
                      const isActive = activeSessionId === interview._id;

                      return (
                        <motion.div
                          key={interview._id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: "-100%" }}
                          transition={{ duration: 0.3 }}
                          className="relative group"
                        >
                          <button
                            onClick={() => {
                              if (!isActive) {
                                setActiveSessionId(interview._id);
                                navigate(`/interview-history/${interview._id}`);
                              }
                            }}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                              isActive
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ring-1 ring-cyan-400/40"
                                : "bg-gray-800/30 hover:bg-gray-800/50 border border-transparent"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-r ${domainInfo.color} flex items-center justify-center text-sm`}
                            >
                              {domainInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {domainInfo.name}
                              </p>
                              <div className="flex items-center text-gray-400 text-xs">
                                <span>{formatDate(interview.createdAt)}</span>
                                <span className="mx-1">•</span>
                                <span className="capitalize">
                                  {interview.difficulty}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center bg-gradient-to-r ${
                                interview.score >= 80
                                  ? "from-green-500 to-emerald-500"
                                  : interview.score >= 60
                                  ? "from-yellow-500 to-amber-500"
                                  : "from-red-500 to-rose-500"
                              }`}
                            >
                              <span className="text-white text-xs font-bold">
                                {interview.score}
                              </span>
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-4 pb-2 border-t border-gray-700/50 mt-4">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === 1
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      &larr;
                    </button>

                    <span className="px-2 text-sm text-gray-400 flex items-center">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === totalPages
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header - Absolutely positioned to not scroll */}
      <div
        className={`fixed top-16 right-0 transition-all duration-300 ${
          isSidebarOpen ? "md:left-80" : "left-0"
        } p-4 border-b border-gray-800 backdrop-blur-sm bg-gray-900/50 flex items-center justify-between z-30 h-16`}
      >
        {activeSessionId && selectedInterview ? (
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                getDomainInfo(selectedInterview.domain).color
              } flex items-center justify-center`}
            >
              {getDomainInfo(selectedInterview.domain).icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {getDomainInfo(selectedInterview.domain).name} Interview
              </h1>
              <p className="text-sm text-gray-400">
                {formatDate(selectedInterview.createdAt)} •
                <span className="capitalize ml-1">
                  {selectedInterview.difficulty}
                </span>{" "}
                • Score: {selectedInterview.score}%
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-white">Interview Details</h1>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate("/mock-interview-selection")}
            className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            New Interview
          </button>
        </div>
      </div>

      {/* Content Area - Main content with fixed positioning and scrollable inner content */}
      <div
        className={`fixed transition-all duration-300 ${
          isSidebarOpen ? "md:left-80" : "left-0"
        } right-0 top-32 bottom-0 overflow-hidden`}
      >
        {!activeSessionId ? (
          <div className="h-full flex items-center justify-center p-8">
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
                Select an Interview
              </h3>
              <p className="text-gray-400 mb-4">
                Choose an interview from the sidebar to view details
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">{renderContent()}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InterviewHistory;
