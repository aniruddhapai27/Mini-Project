import { useState, useEffect, useRef, useCallback } from "react";
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
  selectHistoryError,
  selectHistoryTotalPages,
  selectHistoryCurrentPage,
  selectHistoryTotalInterviews,
  selectSessionLoading,
  selectFeedbackLoading,
  selectFeedback,
} from "../redux/slices/interviewSlice";
import { motion, AnimatePresence } from "framer-motion";

const InterviewHistory = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Redux selectors
  const interviews = useSelector(selectInterviewHistory);
  const loading = useSelector(selectHistoryLoading);
  const error = useSelector(selectHistoryError);
  const totalPages = useSelector(selectHistoryTotalPages);
  const currentPage = useSelector(selectHistoryCurrentPage);
  const totalInterviews = useSelector(selectHistoryTotalInterviews);
  const sessionLoading = useSelector(selectSessionLoading);
  const feedbackLoading = useSelector(selectFeedbackLoading);
  const feedbackData = useSelector(selectFeedback);

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
  }, [dispatch, sessionId, interviews]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

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

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(fetchInterviewHistory({ page, limit: 10 }));
    }
  };

  // Map difficulty to color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "from-green-500 to-emerald-500";
      case "medium":
        return "from-yellow-500 to-amber-500";
      case "hard":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-500 to-slate-500";
    }
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Interview History</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Total Interviews: {totalInterviews}
              </h2>
              <div className="flex space-x-2">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border rounded px-3 py-1"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>
            </div>

            {interviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Domain
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Questions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interviews.map((interview) => (
                      <tr
                        key={interview._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(interview.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getDomainName(interview.domain)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(
                              interview.difficulty
                            )}`}
                          >
                            {interview.difficulty.charAt(0).toUpperCase() +
                              interview.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(
                              interview.score
                            )}`}
                          >
                            {interview.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {interview.QnA ? interview.QnA.length / 2 : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => viewInterviewDetails(interview._id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No interview records found.</p>
                <button
                  onClick={() => navigate("/mock-interview")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start a New Interview
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>

                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === page + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewHistory;
