import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { FaTrash } from "react-icons/fa";
import DotLottieLoader from "../components/DotLottieLoader";
import {
  fetchInterviewHistory,
  getInterviewSession,
  getInterviewFeedback,
  deleteInterviewSession,
  selectInterviewHistory,
  selectHistoryLoading,
  selectHistoryTotalPages,
  selectHistoryCurrentPage,
  selectHistoryTotalInterviews,
  selectHistoryPageSize,
  selectDeletingSessionId,
  setPageSize,
} from "../redux/slices/interviewSlice";
// eslint-disable-next-line no-unused-vars
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [activeTab, setActiveTab] = useState("chat"); // New tab state
  const [sessionLoading, setSessionLoading] = useState(false); // Loading state for session data
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    sessionId: null,
    sessionTitle: null,
  }); // Delete confirmation modal state

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // On large screens (lg and above), always keep sidebar open
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        // On small screens, start with sidebar closed for better UX
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redux selectors
  const interviews = useSelector(selectInterviewHistory);
  const loading = useSelector(selectHistoryLoading);
  const totalPages = useSelector(selectHistoryTotalPages);
  const currentPage = useSelector(selectHistoryCurrentPage);
  const totalInterviews = useSelector(selectHistoryTotalInterviews);
  const pageSize = useSelector(selectHistoryPageSize);
  const deletingSessionId = useSelector(selectDeletingSessionId);

  // Fetch interviews on component mount with proper page size handling
  useEffect(() => {
    // Only fetch if we have valid pagination parameters
    if (currentPage >= 1 && pageSize >= 1) {
      dispatch(fetchInterviewHistory({ page: currentPage, limit: pageSize }));
    }
  }, [dispatch, currentPage, pageSize]);

  // Fetch session details if sessionId is provided or selected
  useEffect(() => {
    const fetchSessionData = async (id) => {
      // Don't fetch if this session is currently being deleted
      if (deletingSessionId === id) {
        return;
      }

      try {
        setSessionLoading(true);
        setActiveSessionId(id);

        // Fetch session data
        const sessionResult = await dispatch(getInterviewSession(id)).unwrap();
        setSelectedInterview(sessionResult);

        // Convert QnA to conversation format
        if (sessionResult.QnA && sessionResult.QnA.length > 0) {
          const formattedConversation = sessionResult.QnA.flatMap((item) => {
            const messages = [
              { type: "ai", message: item.bot, timestamp: item.createdAt },
            ];

            // Only add user message if it's not empty
            if (item.user && item.user.trim() !== "") {
              messages.push({
                type: "user",
                message: item.user,
                timestamp: item.createdAt,
              });
            }

            return messages;
          });
          setConversation(formattedConversation);
        }

        // Fetch feedback if available - prioritize feedBack from session data
        if (sessionResult && sessionResult.feedBack) {
          // Use feedback directly from the interview schema
          setFeedback(sessionResult.feedBack);
        } else {
          // Fallback to API call if not in schema
          try {
            const feedbackResult = await dispatch(
              getInterviewFeedback(id)
            ).unwrap();
            if (feedbackResult && feedbackResult.feedback) {
              setFeedback(feedbackResult.feedback);
            }
          } catch {
            console.log("No feedback available from API");
          }
        }

        setSessionLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);

        // If the session is not found and we're not on the main history page,
        // navigate back to avoid showing error for deleted sessions
        if (error.message && error.message.includes("not found")) {
          toast.error("Interview session not found");
          setActiveSessionId(null);
          setSelectedInterview(null);
          setConversation([]);
          setFeedback(null);
          navigate("/interview-history", { replace: true });
        } else {
          toast.error("Failed to load interview session");
        }
        setSessionLoading(false);
      }
    };

    if (sessionId && sessionId !== "undefined") {
      fetchSessionData(sessionId);
    } else if (activeSessionId && activeSessionId !== sessionId) {
      fetchSessionData(activeSessionId);
    } else if (
      interviews &&
      interviews.length > 0 &&
      !activeSessionId &&
      !sessionId
    ) {
      fetchSessionData(interviews[0]._id);
    }
  }, [
    dispatch,
    sessionId,
    interviews,
    activeSessionId,
    deletingSessionId,
    navigate,
  ]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // Handle escape key for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && deleteModal.isOpen) {
        closeDeleteConfirmation();
      }
    };

    if (deleteModal.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [deleteModal.isOpen]);

  // Enhanced pagination handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      dispatch(fetchInterviewHistory({ page, limit: pageSize }));

      // Close any active interview to avoid confusion
      if (page !== currentPage) {
        setActiveSessionId(null);
        setSelectedInterview(null);
        setConversation([]);
        setFeedback(null);
      }
    }
  };

  // Page size handler
  const handlePageSizeChange = (newLimit) => {
    // First update the page size in Redux state
    dispatch(setPageSize(newLimit));

    // Then fetch with the new page size
    dispatch(fetchInterviewHistory({ page: 1, limit: newLimit }));
    setActiveSessionId(null);
    setSelectedInterview(null);
    setConversation([]);
    setFeedback(null);
  };

  // Delete session handler
  const handleDeleteSession = async (sessionIdToDelete) => {
    try {
      // Immediately clear the session if it's the one being deleted
      if (activeSessionId === sessionIdToDelete) {
        setActiveSessionId(null);
        setSelectedInterview(null);
        setConversation([]);
        setFeedback(null);
        setSessionLoading(false);
        navigate("/interview-history", { replace: true });
      }

      // Perform the deletion
      await dispatch(deleteInterviewSession(sessionIdToDelete)).unwrap();
      toast.success("Interview session deleted");

      // Refresh the current page to get updated results
      dispatch(fetchInterviewHistory({ page: currentPage, limit: pageSize }));
    } catch (error) {
      console.error("Error deleting interview session:", error);
      toast.error("Failed to delete interview session");

      // If deletion failed and we cleared the session, we should try to restore it
      if (activeSessionId === null && sessionIdToDelete) {
        // Only restore if the user was viewing this session before deletion attempt
        const urlSessionId = window.location.pathname.split("/").pop();
        if (urlSessionId === sessionIdToDelete) {
          // Don't restore - user intended to delete it
          // Just stay on the history page without any session selected
        }
      }
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (sessionId, sessionTitle) => {
    setDeleteModal({ isOpen: true, sessionId, sessionTitle });
  };

  // Close delete confirmation modal
  const closeDeleteConfirmation = () => {
    setDeleteModal({ isOpen: false, sessionId: null, sessionTitle: null });
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (deleteModal.sessionId) {
      await handleDeleteSession(deleteModal.sessionId);
      closeDeleteConfirmation();
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

  const renderTabContent = () => {
    if (sessionLoading && activeSessionId) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-400">Loading session data...</p>
          </div>
        </div>
      );
    }

    if (!selectedInterview) {
      return (
        <div className="flex items-center justify-center py-20 h-full">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
              <svg
                className="w-10 h-10 text-cyan-400"
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
            <h3 className="text-xl font-bold text-white mb-3">
              Your Interview History
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Select an interview session from the sidebar to view the
              conversation, feedback, and detailed analysis of your performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-cyan-400 mb-1">📊</div>
                <div className="font-medium text-gray-300">View Feedback</div>
                <div className="text-gray-500">Detailed AI analysis</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 mb-1">💬</div>
                <div className="font-medium text-gray-300">Review Answers</div>
                <div className="text-gray-500">Complete conversation</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "chat") {
      return (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
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
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No Conversation Data
                </h3>
                <p className="text-gray-400 text-sm">
                  No conversation data is available for this interview session.
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>
      );
    }

    if (activeTab === "feedback") {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ maxHeight: "80vh" }}
        >
          {feedback ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                Interview Feedback & Analysis
              </h2>

              <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg p-6">
                <div className="space-y-6">
                  {typeof feedback === "object" ? (
                    <>
                      {/* Overall Score Display */}
                      {feedback.overall_score && (
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white text-2xl font-bold">
                            {feedback.overall_score}
                          </div>
                          <p className="text-gray-300 mt-2">Overall Score</p>
                        </div>
                      )}

                      {/* Technical Knowledge */}
                      {feedback.feedback?.technical_knowledge && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Technical Knowledge
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-300">
                              {feedback.feedback.technical_knowledge}
                            </p>
                            {feedback.feedback.suggestions
                              ?.technical_knowledge && (
                              <div className="mt-3 p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded">
                                <p className="text-blue-300 text-sm font-medium">
                                  Improvement Suggestion:
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                  {
                                    feedback.feedback.suggestions
                                      .technical_knowledge
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Communication Skills */}
                      {feedback.feedback?.communication_skills && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            Communication Skills
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-300">
                              {feedback.feedback.communication_skills}
                            </p>
                            {feedback.feedback.suggestions
                              ?.communication_skills && (
                              <div className="mt-3 p-3 bg-green-500/10 border-l-4 border-green-500 rounded">
                                <p className="text-green-300 text-sm font-medium">
                                  Improvement Suggestion:
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                  {
                                    feedback.feedback.suggestions
                                      .communication_skills
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Confidence */}
                      {feedback.feedback?.confidence && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-purple-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Confidence Level
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-300">
                              {feedback.feedback.confidence}
                            </p>
                            {feedback.feedback.suggestions?.confidence && (
                              <div className="mt-3 p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded">
                                <p className="text-purple-300 text-sm font-medium">
                                  Improvement Suggestion:
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                  {feedback.feedback.suggestions.confidence}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Problem Solving */}
                      {feedback.feedback?.problem_solving && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                              />
                            </svg>
                            Problem Solving
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-300">
                              {feedback.feedback.problem_solving}
                            </p>
                            {feedback.feedback.suggestions?.problem_solving && (
                              <div className="mt-3 p-3 bg-orange-500/10 border-l-4 border-orange-500 rounded">
                                <p className="text-orange-300 text-sm font-medium">
                                  Improvement Suggestion:
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                  {
                                    feedback.feedback.suggestions
                                      .problem_solving
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Strengths */}
                      {feedback.strengths && feedback.strengths.length > 0 && (
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
                            Key Strengths
                          </h3>
                          <ul className="list-disc list-inside space-y-2 pl-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx} className="text-gray-300">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas for Improvement */}
                      {feedback.areas_for_improvement &&
                        feedback.areas_for_improvement.length > 0 && (
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
                            <ul className="list-disc list-inside space-y-2 pl-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                              {feedback.areas_for_improvement.map(
                                (area, idx) => (
                                  <li key={idx} className="text-gray-300">
                                    {area}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Domain-Specific Insights */}
                      {feedback.domain_specific_insights && (
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
                            Domain-Specific Insights
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-300">
                              {feedback.domain_specific_insights}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recommended Next Steps */}
                      {feedback.recommended_next_steps &&
                        feedback.recommended_next_steps.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-indigo-400 mb-2 flex items-center">
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
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              Recommended Next Steps
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 pl-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                              {feedback.recommended_next_steps.map(
                                (step, idx) => (
                                  <li key={idx} className="text-gray-300">
                                    {step}
                                  </li>
                                )
                              )}
                            </ol>
                          </div>
                        )}

                      {/* Interview Metrics */}
                      {(feedback.questions_answered ||
                        feedback.interview_duration_minutes ||
                        feedback.confidence_level) && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-400 mb-2 flex items-center">
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            Interview Metrics
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {feedback.questions_answered && (
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-cyan-400">
                                  {feedback.questions_answered}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  Questions Answered
                                </div>
                              </div>
                            )}
                            {feedback.interview_duration_minutes && (
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-green-400">
                                  {feedback.interview_duration_minutes}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  Minutes
                                </div>
                              </div>
                            )}
                            {feedback.confidence_level && (
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-purple-400 capitalize">
                                  {feedback.confidence_level}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  Confidence Level
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Legacy feedback support */}
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
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                Interview Feedback & Analysis
              </h2>
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No Feedback Available
                </h3>
                <p className="text-gray-400 text-sm">
                  Feedback has not been generated for this interview session
                  yet. Complete the interview to receive comprehensive feedback
                  and analysis.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    return null;
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
      className="h-full  bg-black flex relative overflow-hidden"
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

      {/* Mobile Overlay - appears when sidebar is open on small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar Toggle Button - Only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-1/2 -translate-y-1/2 left-0 z-30 transition-all duration-300 group text-white shadow-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-r-lg px-2 py-3 hover:scale-105"
          aria-label="Open sidebar"
          title="Open Sidebar"
        >
          <div className="flex items-center justify-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      )}

      {/* Sidebar - Interview History List */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full sm:w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 fixed top-16 bottom-0 left-0 z-20 flex flex-col h-[calc(100vh-4rem)] overflow-x-hidden shadow-2xl"
          >
            {/* Sidebar Header */}
            <div className="p-3 sm:p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Interview History
                </h2>
                <div className="flex items-center space-x-2">
                  {/* Close button - visible on small screens */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
                    title="Close Sidebar"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                  {/* New Interview button */}
                  <button
                    onClick={() => navigate("/mock-interview-selection")}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Start New Interview"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
            </div>

            {/* Interview List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 relative">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading interviews...</p>
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
                              // Don't allow selection if this session is being deleted
                              if (deletingSessionId === interview._id) {
                                return;
                              }

                              if (!isActive) {
                                setActiveSessionId(interview._id);
                                navigate(`/interview-history/${interview._id}`);
                                // Close sidebar on small screens for better mobile UX
                                if (window.innerWidth < 1024) {
                                  setIsSidebarOpen(false);
                                }
                              }
                            }}
                            className={`w-full p-2 sm:p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-2 sm:space-x-3 ${
                              deletingSessionId === interview._id
                                ? "bg-red-500/10 border border-red-500/30 opacity-50 cursor-not-allowed"
                                : isActive
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ring-1 ring-cyan-400/40"
                                : "bg-gray-800/30 hover:bg-gray-800/50 border border-transparent"
                            }`}
                            disabled={deletingSessionId === interview._id}
                          >
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r ${domainInfo.color} flex items-center justify-center text-xs sm:text-sm`}
                            >
                              {domainInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-white text-xs sm:text-sm font-medium truncate">
                                  {domainInfo.name}
                                </p>
                                {interview.feedBack && (
                                  <span
                                    className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full ml-2"
                                    title="Feedback Available"
                                  ></span>
                                )}
                              </div>
                              <div className="flex items-center text-gray-400 text-xs">
                                <span className="truncate">
                                  {formatDate(interview.createdAt)}
                                </span>
                                <span className="mx-1 hidden sm:inline">•</span>
                                <span className="capitalize hidden sm:inline">
                                  {interview.difficulty}
                                </span>
                                {interview.QnA && (
                                  <>
                                    <span className="mx-1 hidden sm:inline">
                                      •
                                    </span>
                                    <span className="hidden sm:inline">
                                      {interview.QnA.length} questions
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div
                              className={`rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r ${
                                (interview.feedBack?.overall_score || 0) >= 80
                                  ? "from-green-500 to-emerald-500"
                                  : (interview.feedBack?.overall_score || 0) >=
                                    60
                                  ? "from-yellow-500 to-amber-500"
                                  : "from-red-500 to-rose-500"
                              }`}
                            >
                              <span className="text-white text-xs font-bold">
                                {interview.feedBack?.overall_score || 0}
                              </span>
                            </div>
                            <button
                              className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete interview session"
                              onClick={(e) => {
                                e.stopPropagation();
                                showDeleteConfirmation(
                                  interview._id,
                                  interview.title ||
                                    `${interview.type} Interview`
                                );
                              }}
                              disabled={deletingSessionId === interview._id}
                            >
                              {deletingSessionId === interview._id ? (
                                <DotLottieLoader size="w-4 h-4" />
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Page Size Selector */}
              {(interviews.length > 0 || totalPages > 0) && (
                <div className="flex justify-between items-center pt-3 pb-2 border-t border-gray-700/50 mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(parseInt(e.target.value))
                      }
                      className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                      disabled={loading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={25}>25</option>
                    </select>
                    <span className="text-xs text-gray-500">per page</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Total: {totalInterviews || 0} interviews
                  </div>
                </div>
              )}

              {/* Enhanced Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center pt-4 pb-2 border-t border-gray-700/50 mt-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {/* First Page Button */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === 1
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                      }`}
                      title="First page"
                    >
                      ⟨⟨
                    </button>

                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === 1
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

                      if (totalPages <= 4) {
                        // If 4 or fewer pages, show all pages
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                                i === currentPage
                                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                      } else {
                        // More than 4 pages: show pattern like "1 2 3 ..... 9"
                        // Always show first 3 pages
                        for (let i = 1; i <= 3; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                                i === currentPage
                                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Add ellipsis if there's a gap
                        if (totalPages > 4) {
                          pages.push(
                            <span
                              key="ellipsis"
                              className="text-gray-600 px-1 text-sm"
                            >
                              .....
                            </span>
                          );
                        }

                        // Always show last page
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                              totalPages === currentPage
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`}
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}

                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === totalPages
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                      }`}
                      title="Next page"
                    >
                      ›
                    </button>

                    {/* Last Page Button */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === totalPages
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                      }`}
                      title="Last page"
                    >
                      ⟩⟩
                    </button>
                  </div>

                  {/* Page Info */}
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages} • {interviews.length}{" "}
                    interviews shown
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header - Responsive positioning based on sidebar state */}
      <div
        className={`fixed top-16 right-0 transition-all duration-300 ${
          isSidebarOpen ? "lg:left-80 left-0" : "left-0"
        } p-4 border-b border-gray-800 backdrop-blur-sm bg-gray-900/80 flex items-center justify-between z-10 h-16`}
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
              <h1 className="text-md md:text-xl font-bold text-white">
                {getDomainInfo(selectedInterview.domain).name} Interview
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {formatDate(selectedInterview.createdAt)}
                <span className="mx-1 hidden sm:inline">•</span>
                <span className="block sm:inline">
                  <span className="capitalize ml-1">
                    {selectedInterview.difficulty}
                  </span>{" "}
                  • Score: {selectedInterview.feedBack?.overall_score || 0}%
                </span>
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

      {/* Content Area - Responsive layout with proper sidebar spacing */}
      <div
        className={`fixed transition-all duration-300 ${
          isSidebarOpen ? "lg:left-80 left-0" : "left-0"
        } right-0 top-32 bottom-0 overflow-hidden flex flex-col`}
      >
        {!activeSessionId ? (
          <div className="h-full flex items-center justify-center p-4 sm:p-8">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.414L3 21l2.414-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Select an Interview
              </h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Choose an interview from the sidebar to view details
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Fixed Tab Navigation */}
            <div className="flex-shrink-0 p-3 sm:p-6 pb-0">
              <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 sm:space-x-8">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "chat"
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
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
                      <span>Interview Chat</span>
                      {conversation.length > 0 && (
                        <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {Math.floor(conversation.length / 2)}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("feedback")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "feedback"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Feedback & Analysis</span>
                      {feedback && (
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      )}
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 pt-6">{renderTabContent()}</div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDeleteConfirmation}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-400"
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
              </div>
              <h3 className="text-lg font-semibold text-white">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "
              <span className="font-medium text-white">
                {deleteModal.sessionTitle}
              </span>
              "? This action cannot be undone and all conversation data and
              feedback will be permanently lost.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={closeDeleteConfirmation}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                disabled={deletingSessionId === deleteModal.sessionId}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                disabled={deletingSessionId === deleteModal.sessionId}
              >
                {deletingSessionId === deleteModal.sessionId ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FaTrash size={14} />
                    <span>Delete</span>
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default InterviewHistory;
