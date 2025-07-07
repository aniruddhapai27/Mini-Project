import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getInterviewStats,
  getRecentInterviews,
} from "../redux/slices/interviewSlice";
import { studyAssistantApi } from "../utils/api";
import DotLottieLoader from "../components/DotLottieLoader";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { stats, statsLoading, recentInterviews, recentLoading } = useSelector(
    (state) => state.interview
  );

  // Local state for assistant stats
  const [assistantStats, setAssistantStats] = useState(null);
  const [assistantStatsLoading, setAssistantStatsLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentSessionsLoading, setRecentSessionsLoading] = useState(false);

  // For displaying user data
  const userData = user || {
    name: "User",
    email: "user@example.com",
    profilePic: null,
  };

  // Fetch assistant stats
  const fetchAssistantStats = async () => {
    try {
      setAssistantStatsLoading(true);
      const response = await studyAssistantApi.getStats();
      if (response.success) {
        setAssistantStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching assistant stats:", error);
    } finally {
      setAssistantStatsLoading(false);
    }
  };

  // Fetch recent assistant sessions
  const fetchRecentSessions = async () => {
    try {
      setRecentSessionsLoading(true);
      const response = await studyAssistantApi.getRecentSessions(3);
      if (response.success) {
        setRecentSessions(response.data.sessions);
      }
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
    } finally {
      setRecentSessionsLoading(false);
    }
  };

  // Fetch dynamic data on component mount
  useEffect(() => {
    dispatch(getInterviewStats());
    dispatch(getRecentInterviews(5));
    fetchAssistantStats();
    fetchRecentSessions();
  }, [dispatch]);

  // Helper function to format domain names
  const formatDomainName = (domain) => {
    const domainMap = {
      hr: "HR Interview",
      dataScience: "Data Science",
      webdev: "Web Development",
      fullTechnical: "Technical Interview",
      technical: "Technical Interview",
      behavioral: "Behavioral Interview",
      systemDesign: "System Design",
    };
    return (
      domainMap[domain] ||
      domain?.charAt(0).toUpperCase() + domain?.slice(1) ||
      "Interview"
    );
  };
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle Black Gradient Orbs */}
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-gradient-to-br from-gray-900/15 to-black rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-gradient-to-br from-gray-800/10 to-black rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        {/* Dashboard Grid Pattern */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-dashboard"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dashboard)" />
          </svg>
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="circuit-dashboard"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,50 L25,50 M75,50 L100,50 M50,0 L50,25 M50,75 L50,100"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle cx="25" cy="50" r="2" fill="white" opacity="0.2" />
                <circle cx="75" cy="50" r="2" fill="white" opacity="0.2" />
                <circle cx="50" cy="25" r="2" fill="white" opacity="0.2" />
                <circle cx="50" cy="75" r="2" fill="white" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-dashboard)" />
          </svg>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-16 left-16 w-2 h-2 bg-gray-800/35 rotate-45 animate-float-slow"></div>
        <div className="absolute top-24 right-24 w-3 h-3 bg-gray-700/30 animate-float-medium"></div>
        <div className="absolute bottom-24 left-24 w-1 h-8 bg-gray-600/25 animate-float-fast"></div>
        <div className="absolute bottom-16 right-16 w-8 h-1 bg-gray-500/25 animate-float-slow"></div>
      </div>

      <div className="w-full relative z-10">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Welcome back, {userData.name}
          </h1>
          <p className="mt-2 text-black/70 dark:text-white/70">
            Ready to ace your next interview?
          </p>
        </div>{" "}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white text-sm">
                  Total Interviews
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  {statsLoading ? "..." : stats?.totalInterviews || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-cyan-400"
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
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white text-sm">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-purple-400">
                  {statsLoading
                    ? "..."
                    : `${Math.round(stats?.averageScore || 0)}%`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
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
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white text-sm">
                  Questions Answered
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {statsLoading ? "..." : stats?.totalQuestions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 mt-8">
          {/* Practice Types */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Practice Activities
            </h2>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Resume ATS Analysis */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 group hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-blue-400"
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
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Resume ATS Check
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Analyze your resume with ATS scoring and get personalized
                  improvement suggestions.
                </p>
                <button
                  onClick={() => navigate("/resume-ats")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Check Resume
                </button>
              </div>

              {/* Daily Questions */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 group hover:border-emerald-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Daily Questions
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Practice with curated daily questions across different CS
                  subjects and difficulty levels.
                </p>
                <button
                  onClick={() => navigate("/quiz-selection")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Questions
                </button>
              </div>

              {/* Study Assistant */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-6 group hover:border-indigo-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-indigo-400"
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
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Study Assistant
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Get personalized help with CS subjects using AI-powered study
                  companion.
                </p>
                <button
                  onClick={() => navigate("/study-assistant/new")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Learning
                </button>
              </div>

              {/* Full Mock Interview */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 group hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Full Mock Interview
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Complete interview simulation with multiple rounds and
                  comprehensive feedback.
                </p>
                <button
                  onClick={() => navigate("/mock-interview-selection")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Mock Interview
                </button>
              </div>
            </div>
          </div>

          {/* Recent Sessions & Profile */}
          <div className="space-y-8">
            {/* Quick Stats */}
            {stats && !statsLoading && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Interview Performance
                  </h3>
                  <button
                    onClick={() => {
                      dispatch(getInterviewStats());
                      dispatch(getRecentInterviews(5));
                    }}
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Refresh data"
                  >
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {Math.round(stats.averageScore || 0)}%
                    </div>
                    <div className="text-xs text-gray-400">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {stats.totalInterviews || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Sessions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Assistant Stats */}
            {assistantStatsLoading ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex justify-center py-8">
                  <DotLottieLoader
                    size="md"
                    text="Loading assistant stats..."
                    layout="vertical"
                    color="purple"
                  />
                </div>
              </div>
            ) : assistantStats ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Study Assistant
                  </h3>
                  <button
                    onClick={() => {
                      fetchAssistantStats();
                      fetchRecentSessions();
                    }}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                    title="Refresh data"
                  >
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {assistantStats.totalSessions || 0}
                    </div>
                    <div className="text-xs text-gray-400">Chat Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      {assistantStats.totalMessages || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Messages</div>
                  </div>
                </div>

                {/* Recent Study Sessions */}
                {recentSessionsLoading ? (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Recent Study Sessions
                    </h4>
                    <div className="flex justify-center py-4">
                      <DotLottieLoader size="sm" text="Loading sessions..." />
                    </div>
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Recent Study Sessions
                    </h4>
                    <div className="space-y-2">
                      {recentSessions.map((session) => (
                        <div
                          key={session._id}
                          className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              {session.subject === "ADA" && "🔢"}
                              {session.subject === "CN" && "🌐"}
                              {session.subject === "DBMS" && "💾"}
                              {session.subject === "OS" && "💻"}
                              {session.subject === "SE" && "⚙️"}
                              {session.subject === "DS" && "📊"}
                            </div>
                            <div>
                              <p className="text-white text-xs font-medium">
                                {session.subject}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {session.messageCount} messages
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/study-assistant/${session._id}`)
                            }
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            Continue →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Profile Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  {userData.profilePic ? (
                    <img
                      src={userData.profilePic}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{userData.name}</p>
                  <p className="text-gray-400 text-sm">{userData.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="w-full py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 block text-center"
              >
                View Profile
              </Link>
            </div>

            {/* Recent Sessions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Sessions
              </h3>

              {recentLoading ? (
                <div className="flex justify-center py-8">
                  <DotLottieLoader
                    size="md"
                    text="Loading recent sessions..."
                    layout="vertical"
                    color="blue"
                  />
                </div>
              ) : recentInterviews && recentInterviews.length > 0 ? (
                <div className="space-y-3">
                  {recentInterviews.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {formatDomainName(session.domain)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(session.createdAt).toLocaleDateString()} •{" "}
                          {session.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            session.score >= 90
                              ? "text-green-400"
                              : session.score >= 80
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {session.score
                            ? `${Math.round(session.score)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">
                    No recent sessions yet
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Start practicing to see your history!
                  </p>
                </div>
              )}

              <Link
                to="/profile"
                className="w-full mt-4 py-2 px-4 text-cyan-400 text-sm hover:text-cyan-300 transition-colors duration-300 block text-center"
              >
                View All Sessions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
