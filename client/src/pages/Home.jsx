import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-black relative overflow-hidden">
      {/* Grid Background - Only for Home page */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div>
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
