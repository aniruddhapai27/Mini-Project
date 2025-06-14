import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="text-center max-w-6xl mx-auto px-4">
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-black dark:text-white">
          SkillWise-AI
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-black dark:text-white mb-4 max-w-3xl mx-auto leading-relaxed">
          Master your interview skills with AI-powered practice sessions
        </p>

        <p className="text-lg text-black/70 dark:text-white/70 mb-12 max-w-2xl mx-auto">
          Get personalized feedback, practice with real interview questions, and
          boost your confidence with our cutting-edge AI assistant.
        </p>        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm transition-all duration-300 group hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
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
          </div>
        </div>        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 animate-fadeIn border border-purple-500/30"
          >
            Start Practicing Now
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 animate-fadeIn border border-cyan-500/30"
          >
            Sign In
          </Link>
        </div>        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              10K+
            </div>
            <div className="text-black/70 dark:text-white/70 text-sm">
              Practice Sessions
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              95%
            </div>
            <div className="text-black/70 dark:text-white/70 text-sm">
              Success Rate
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-400 mb-2">
              24/7
            </div>
            <div className="text-black/70 dark:text-white/70 text-sm">
              AI Availability
            </div>
          </div>
        </div>
      </div>

      {/* Floating action elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block">
        <div className="w-20 h-20 border-2 border-black/30 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 bg-black/50 rounded-full"></div>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 hidden lg:block">
        <div className="w-16 h-16 border-2 border-black/30 rounded-full flex items-center justify-center animate-pulse delay-500">
          <div className="w-6 h-6 bg-black/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
