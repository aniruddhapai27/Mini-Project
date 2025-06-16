import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCreateLoading,
  selectCreateError,
  selectLevel,
  selectTotalXP,
  selectStreakCount,
  clearCreateError,
} from "../redux/slices/interviewSlice";
import { selectUser } from "../redux/slices/authSlice";

const MockInterviewSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const createLoading = useSelector(selectCreateLoading);
  const createError = useSelector(selectCreateError);
  const level = useSelector(selectLevel);
  const totalXP = useSelector(selectTotalXP);
  const streakCount = useSelector(selectStreakCount);
  const user = useSelector(selectUser);

  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Available domains and difficulties
  const domains = [
    {
      id: "hr",
      name: "HR Interview",
      description: "Human resources and behavioral questions",
      icon: "�",
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/30",
    },
    {
      id: "dataScience",
      name: "Data Science",
      description: "Statistics, ML, analytics, and data insights",
      icon: "📊",
      color: "from-green-500/10 to-emerald-500/10 border-green-500/30",
    },
    {
      id: "webdev",
      name: "Web Development",
      description: "Frontend, backend, and full-stack development",
      icon: "�",
      color: "from-purple-500/10 to-violet-500/10 border-purple-500/30",
    },
    {
      id: "fullTechnical",
      name: "Full Technical",
      description: "Comprehensive technical interview covering all areas",
      icon: "⚡",
      color: "from-red-500/10 to-orange-500/10 border-red-500/30",
    },
  ];

  const difficulties = [
    {
      id: "easy",
      name: "Easy",
      description: "Perfect for beginners",
      icon: "🌱",
      xpMultiplier: "1x",
      color: "bg-green-500",
    },
    {
      id: "medium",
      name: "Medium",
      description: "Intermediate level challenge",
      icon: "🔥",
      xpMultiplier: "1.5x",
      color: "bg-yellow-500",
    },
    {
      id: "hard",
      name: "Hard",
      description: "Expert level challenge",
      icon: "⚡",
      xpMultiplier: "2x",
      color: "bg-red-500",
    },
  ];
  const handleStartInterview = async () => {
    if (!selectedDomain || !selectedDifficulty) {
      alert("Please select both domain and difficulty");
      return;
    }

    try {
      // For the new conversational interview system, we'll create a session ID and navigate directly
      const sessionId = "new"; // Let the interview page handle session creation
      navigate(`/mock-interview/${sessionId}`, {
        state: {
          domain: selectedDomain,
          difficulty: selectedDifficulty,
        },
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
    }
  };

  useEffect(() => {
    // Clear any previous errors when component mounts
    if (createError) {
      dispatch(clearCreateError());
    }
  }, [dispatch, createError]);

  // Check if user has resume uploaded
  const hasResume = user?.resume;

  useEffect(() => {
    // Show resume prompt if user doesn't have resume
    if (!hasResume) {
      setShowResumePrompt(true);
    }
  }, [hasResume]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-8">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="hexagons"
                x="0"
                y="0"
                width="50"
                height="43.4"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="circuit"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="20"
                  y="20"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <circle cx="30" cy="10" r="2" fill="white" opacity="0.3" />
                <circle cx="50" cy="30" r="2" fill="white" opacity="0.3" />
                <circle cx="30" cy="50" r="2" fill="white" opacity="0.3" />
                <circle cx="10" cy="30" r="2" fill="white" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-16 left-16 w-4 h-4 bg-white opacity-10 rotate-45 animate-float-slow"></div>
        <div className="absolute top-24 right-24 w-6 h-6 bg-gray-300 opacity-15 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-20 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-16 right-16 w-5 h-5 bg-gray-400 opacity-12 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white opacity-25 rotate-45 animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-gray-500 opacity-10 rounded-full animate-float-fast"></div>

        {/* Diamond Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="diamonds"
                x="0"
                y="0"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M15,0 L30,15 L15,30 L0,15 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300/20 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute left-0 top-1/5 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-gray-400/15 to-transparent animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Particle System */}
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-white opacity-40 rounded-full animate-ping"></div>
        <div
          className="absolute top-3/4 left-1/4 w-1 h-1 bg-gray-300 opacity-50 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-1 h-1 bg-white opacity-60 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {" "}
        {/* Header with Gamification Elements */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fadeIn">
            Mock Interview Challenge
          </h1>
          <p className="text-lg text-gray-300 mb-6 animate-fadeIn">
            Test your skills with AI-powered interview simulation
          </p>          {/* Gamification Stats */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="bg-gradient-to-br from-gray-600/10 to-gray-800/10 border border-gray-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xl font-bold text-gray-400">
                Level {level}
              </div>
              <div className="text-xs text-gray-400">Current Level</div>
            </div>

            <div className="bg-gradient-to-br from-gray-700/10 to-gray-900/10 border border-gray-600/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xl font-bold text-gray-400">{totalXP}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>

            <div className="bg-gradient-to-br from-gray-500/10 to-gray-700/10 border border-gray-400/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold text-gray-400">
                {streakCount}
              </div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Resume Status */}
          <div className="mb-8">
            {hasResume ? (
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-green-400">Resume Ready</h3>
                </div>
                <p className="text-green-300 text-center mb-4">
                  Your interviews will be personalized based on your uploaded resume
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => window.open(user.resume, '_blank')}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    View Resume
                  </button>
                  <Link
                    to="/profile"
                    className="text-sm bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Manage Resume
                  </Link>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-yellow-400">No Resume Uploaded</h3>
                </div>
                <p className="text-yellow-300 text-center mb-4">
                  Upload your resume to get personalized interview questions based on your experience
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    to="/profile"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Resume
                  </Link>
                  <button
                    onClick={() => setShowResumePrompt(false)}
                    className="text-sm text-yellow-400 hover:text-yellow-300 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Continue Without Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Domain Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Choose Your Interview Domain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className={`bg-gradient-to-br ${
                  domain.color
                } border-2 backdrop-blur-xl rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none shadow-lg animate-fadeIn ${
                  selectedDomain === domain.id
                    ? "ring-2 ring-cyan-400 scale-105"
                    : ""
                }`}
                tabIndex={0}
                onClick={() => setSelectedDomain(domain.id)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") setSelectedDomain(domain.id);
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{domain.icon}</div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {domain.name}
                  </h3>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    {domain.description}
                  </p>
                  {selectedDomain === domain.id && (
                    <div className="mt-3 animate-fadeIn">
                      <svg
                        className="w-6 h-6 text-cyan-400 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
            Select Difficulty Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {difficulties.map((difficulty) => (
              <div
                key={difficulty.id}
                className={`bg-black/5 dark:bg-white/5 border-2 ${
                  selectedDifficulty === difficulty.id
                    ? "border-cyan-400 ring-2 ring-cyan-400 scale-105"
                    : "border-black/10 dark:border-white/10"
                } rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none shadow-lg animate-fadeIn`}
                tabIndex={0}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") setSelectedDifficulty(difficulty.id);
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{difficulty.icon}</div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {difficulty.name}
                  </h3>
                  <p className="text-sm text-black/70 dark:text-white/70 mb-3">
                    {difficulty.description}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-bold ${difficulty.color}`}
                    >
                      {difficulty.xpMultiplier} XP
                    </span>
                  </div>
                  {selectedDifficulty === difficulty.id && (
                    <div className="mt-3 animate-fadeIn">
                      <svg
                        className="w-6 h-6 text-cyan-400 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Start Interview Button */}
        <div className="text-center">
          {createError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {createError}
            </div>
          )}

          <button
            className={`py-4 px-8 rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedDomain && selectedDifficulty && !createLoading
                ? "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:scale-105 focus:ring-gray-500"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
            onClick={handleStartInterview}
            disabled={!selectedDomain || !selectedDifficulty || createLoading}
          >
            {createLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Interview...
              </div>
            ) : selectedDomain && selectedDifficulty ? (
              <div className="flex items-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Start{" "}
                {selectedDomain.charAt(0).toUpperCase() +
                  selectedDomain.slice(1)}{" "}
                Interview
              </div>
            ) : (
              "Select Domain & Difficulty First"
            )}
          </button>
        </div>{" "}
        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-600/10 to-gray-800/10 border border-gray-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Interview Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-white mb-1">Be Specific</h4>
              <p className="text-sm text-gray-300">
                Provide detailed answers with examples
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold text-white mb-1">Take Your Time</h4>
              <p className="text-sm text-gray-300">
                Think before answering, quality over speed
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💪</div>
              <h4 className="font-semibold text-white mb-1">Stay Confident</h4>
              <p className="text-sm text-gray-300">
                Express your thoughts clearly and confidently
              </p>
            </div>
          </div>
        </div>

        {/* Resume Upload Prompt */}
        {showResumePrompt && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black/80 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Upload Your Resume
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                To provide a personalized interview experience, please upload your
                resume.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/profile"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg py-2 px-4 text-center text-white font-semibold transition-all duration-300 hover:scale-105"
                >
                  Upload Resume
                </Link>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="flex-1 bg-gray-700 rounded-lg py-2 px-4 text-center text-white font-semibold transition-all duration-300 hover:scale-105"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewSelection;
