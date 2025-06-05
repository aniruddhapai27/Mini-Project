import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

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
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {userData.name}
          </h1>
          <p className="mt-2 text-gray-400">
            Ready to ace your next interview?
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Practice Sessions</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {userData.practiceCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
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

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-purple-400">
                  {userData.averageScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
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

          <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-xl p-6 hover:border-pink-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Practice Time</p>
                <p className="text-3xl font-bold text-pink-400">
                  {userData.totalTime}
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-pink-400"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Practice Types */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
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
                >
                  Take Quiz
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Interview */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-all duration-300">
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
                  className="w-full py-2 px-4 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-all duration-300"
                >
                  Start Practice
                </button>
              </div>

              {/* Behavioral Interview */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300">
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
                  className="w-full py-2 px-4 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
                >
                  Start Practice
                </button>
              </div>

              {/* System Design */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center group-hover:bg-pink-500/30 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-pink-400"
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
                  className="w-full py-2 px-4 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500 hover:text-white transition-all duration-300"
                >
                  Start Practice
                </button>
              </div>

              {/* Mock Interview */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300">
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
                  onClick={() => handleStartPractice("Mock Interview")}
                  className="w-full py-2 px-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-300"
                >
                  Start Practice
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
