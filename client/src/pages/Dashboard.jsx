import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Redux state
  const { user } = useSelector((state) => state.auth);

  // For displaying user data
  const userData = user || {
    name: "User",
    email: "user@example.com",
    profilePic: null,
  };
  return (
    <div className="minh-screen bg-black relative overflow-hidden">
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
        <div className="px-4 sm:px-6 lg:px-8 pt-8 md:ml-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Welcome back, {userData.name}
          </h1>
          <p className="mt-2 text-black/70 dark:text-white/70">
            Ready to ace your next interview?
          </p>
        </div>
        {/* Practice Activities */}
        <div className="px-4 sm:px-6 lg:px-8 mt-8 md:ml-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
      </div>
    </div>
  );
};

export default Dashboard;
