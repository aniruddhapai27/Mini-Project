import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Hero Section */}
      <div className="text-center max-w-6xl mx-auto px-4">
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            InterviewAI
          </span>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-2xl rounded-lg"></div>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
          Master your interview skills with AI-powered practice sessions
        </p>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Get personalized feedback, practice with real interview questions, and
          boost your confidence with our cutting-edge AI assistant.
        </p>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-cyan-500/30 transition-all duration-300">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-400 text-sm">
              Advanced AI analyzes your responses and provides instant feedback
            </p>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-500/30 transition-all duration-300">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Real Questions
            </h3>
            <p className="text-gray-400 text-sm">
              Practice with questions from top companies and industries
            </p>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-pink-500/30 transition-all duration-300">
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
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-pink-400 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-400 text-sm">
              Monitor your improvement with detailed analytics and insights
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transform hover:scale-105"
          >
            Start Practicing Now
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            Sign In
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              10K+
            </div>
            <div className="text-gray-400 text-sm mt-1">Practice Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              95%
            </div>
            <div className="text-gray-400 text-sm mt-1">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-gray-400 text-sm mt-1">AI Availability</div>
          </div>
        </div>
      </div>

      {/* Floating action elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block">
        <div className="w-20 h-20 border-2 border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 bg-cyan-500/50 rounded-full"></div>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 hidden lg:block">
        <div className="w-16 h-16 border-2 border-purple-500/30 rounded-full flex items-center justify-center animate-pulse delay-500">
          <div className="w-6 h-6 bg-purple-500/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
