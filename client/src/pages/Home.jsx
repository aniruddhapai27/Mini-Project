import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle Black Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-900/15 to-black rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-gray-800/10 to-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-home" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-home)" />
          </svg>
        </div>
        
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-home" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-home)" />
          </svg>
        </div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-gray-800/30 rotate-45 animate-float-slow"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-gray-700/25 animate-float-medium"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-gray-600/25 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-gray-500/30 animate-float-slow"></div>
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10 max-h-screen overflow-hidden">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto px-4 flex flex-col h-screen justify-center">        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black dark:text-white">
          SkillWise-AI
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-black dark:text-white mb-2 max-w-3xl mx-auto leading-relaxed">
          Master your interview skills with AI-powered practice sessions
        </p>

        <p className="text-base text-black/70 dark:text-white/70 mb-6 max-w-2xl mx-auto">
          Get personalized feedback, practice with real interview questions, and
          boost your confidence with our cutting-edge AI assistant.
        </p>        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm transition-all duration-300 group hover:scale-105 hover:shadow-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow-lg">
              <svg
                className="w-6 h-6 text-white"
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
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              AI-Powered
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Advanced AI analyzes your responses and provides instant feedback
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm transition-all duration-300 group hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
              <svg
                className="w-6 h-6 text-white"
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
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              Real Questions
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Practice with questions from top companies and industries
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm transition-all duration-300 group hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Monitor your improvement with detailed analytics and insights
            </p>
          </div>        </div>        {/* CTA Buttons - Only show when not authenticated */}
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 animate-fadeIn border border-purple-500/30"
            >
              Start Practicing Now
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 animate-fadeIn border border-cyan-500/30"
            >
              Sign In
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">            <Link
              to="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 animate-fadeIn border border-cyan-500/30"
            >
              Go to Dashboard
            </Link>
          </div>        )}{/* Stats Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              10K+
            </div>
            <div className="text-black/70 dark:text-white/70 text-xs">
              Practice Sessions
            </div>
          </div>          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              95%
            </div>
            <div className="text-black/70 dark:text-white/70 text-xs">
              Success Rate
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400 mb-1">
              24/7
            </div>
            <div className="text-black/70 dark:text-white/70 text-xs">
              AI Availability
            </div>
          </div></div>
      </div>
      </div>      {/* Floating action elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block z-20">
        <div className="w-16 h-16 border-2 border-black/30 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 bg-black/50 rounded-full"></div>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 hidden lg:block z-20">
        <div className="w-12 h-12 border-2 border-black/30 rounded-full flex items-center justify-center animate-pulse delay-500">
          <div className="w-4 h-4 bg-black/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
