import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // For displaying user data
  const userData = user || {
    name: "User",
    email: "user@example.com",
    profilePic: null,
  };

  const [recentSessions] = useState([
    {
      id: 1,
      type: "Technical",
      score: 92,
      date: "2025-06-01",
      duration: "25 min",
    },
    {
      id: 2,
      type: "Behavioral",
      score: 85,
      date: "2025-05-30",
      duration: "18 min",
    },
    {
      id: 3,
      type: "System Design",
      score: 78,
      date: "2025-05-28",
      duration: "32 min",
    },
  ]);

  const handleStartPractice = (type) => {
    // TODO: integrate with interview practice API
    console.log(`Starting ${type} practice session`);
  };  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle Black Gradient Orbs */}
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-gradient-to-br from-gray-900/15 to-black rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-gradient-to-br from-gray-800/10 to-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }}></div>
          {/* Dashboard Grid Pattern */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-dashboard" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dashboard)" />
          </svg>
        </div>
        
        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-dashboard" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 L25,50 M75,50 L100,50 M50,0 L50,25 M50,75 L50,100" stroke="white" strokeWidth="0.5" fill="none"/>
                <circle cx="25" cy="50" r="2" fill="white" opacity="0.2"/>
                <circle cx="75" cy="50" r="2" fill="white" opacity="0.2"/>
                <circle cx="50" cy="25" r="2" fill="white" opacity="0.2"/>
                <circle cx="50" cy="75" r="2" fill="white" opacity="0.2"/>
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
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white text-sm">
                  Practice Sessions
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  {userData.practiceCount || 12}
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
                  {userData.averageScore || 87}%
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
                  Total Practice Time
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {userData.totalTime || "45h"}
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
        </div>{" "}        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 mt-8">
          {/* Practice Types */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Start New Practice Session
            </h2>

            {/* Daily Questions Banner */}
            <div className="mb-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-cyan-300"
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
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Daily Quiz Challenge
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Test your knowledge with today's practice questions
                    </p>
                  </div>
                </div>
                <Link
                  to="/quiz-selection"
                  className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >                  Take Quiz
                </Link>
              </div>
            </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Technical Interview */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 group hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Technical Interview
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Practice coding problems, data structures, and algorithms with
                  AI feedback.
                </p>
                <button
                  onClick={() => handleStartPractice("Technical")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Practice
                </button>
              </div>

              {/* Behavioral Interview */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 group hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    Behavioral Interview
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Master storytelling and demonstrate your soft skills with STAR
                  method practice.
                </p>
                <button
                  onClick={() => handleStartPractice("Behavioral")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Practice
                </button>
              </div>

              {/* System Design */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 group hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    System Design
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  Learn to design scalable systems and explain complex
                  architectures.
                </p>
                <button
                  onClick={() => handleStartPractice("System Design")}
                  className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Practice
                </button>              </div>

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
                  Get personalized help with CS subjects using AI-powered study companion.
                </p>
                <button
                  onClick={() => navigate('/study-assistant/new')}
                  className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Learning
                </button>
              </div>

              {/* Mock Interview */}
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
                </p>                <button
                  onClick={() => navigate('/mock-interview-selection')}
                  className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Mock Interview
                </button>
              </div>
            </div>
          </div>

          {/* Recent Sessions & Profile */}
          <div className="space-y-8">
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
              </div>{" "}
              <Link
                to="/profile"
                className="w-full py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 block text-center"
              >
                Edit Profile
              </Link>
            </div>

            {/* Recent Sessions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {session.type}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {session.date} • {session.duration}
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
                        {session.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 py-2 px-4 text-cyan-400 text-sm hover:text-cyan-300 transition-colors duration-300"
                onClick={() => {
                  // TODO: integrate view all sessions functionality
                  console.log("View all sessions clicked");
                }}
              >
                View All Sessions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
