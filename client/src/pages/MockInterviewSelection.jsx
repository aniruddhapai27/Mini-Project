import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createInterviewSession,
  selectCreateLoading,
  selectCreateError,
  selectLevel,
  selectTotalXP,
  selectStreakCount,
  clearCreateError
} from '../redux/slices/interviewSlice';

const MockInterviewSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const createLoading = useSelector(selectCreateLoading);
  const createError = useSelector(selectCreateError);
  const level = useSelector(selectLevel);
  const totalXP = useSelector(selectTotalXP);
  const streakCount = useSelector(selectStreakCount);

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Available domains and difficulties
  const domains = [
    {
      id: 'technical',
      name: 'Technical',
      description: 'Coding, algorithms, and system design',
      icon: '💻',
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
    },
    {
      id: 'behavioral',
      name: 'Behavioral',
      description: 'Soft skills and situation-based questions',
      icon: '🤝',
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30'
    },
    {
      id: 'system-design',
      name: 'System Design',
      description: 'Architecture and scalability discussions',
      icon: '🏗️',
      color: 'from-green-500/10 to-emerald-500/10 border-green-500/30'
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Product management and strategy',
      icon: '📱',
      color: 'from-orange-500/10 to-red-500/10 border-orange-500/30'
    }
  ];

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy',
      description: 'Perfect for beginners',
      icon: '🌱',
      xpMultiplier: '1x',
      color: 'bg-green-500'
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Intermediate level challenge',
      icon: '🔥',
      xpMultiplier: '1.5x',
      color: 'bg-yellow-500'
    },
    {
      id: 'hard',
      name: 'Hard',
      description: 'Expert level challenge',
      icon: '⚡',
      xpMultiplier: '2x',
      color: 'bg-red-500'
    }
  ];

  const handleStartInterview = async () => {
    if (!selectedDomain || !selectedDifficulty) {
      alert('Please select both domain and difficulty');
      return;
    }

    try {
      const resultAction = await dispatch(createInterviewSession({
        domain: selectedDomain,
        difficulty: selectedDifficulty
      })).unwrap();

      if (resultAction.sessionId) {
        navigate(`/mock-interview/${resultAction.sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  useEffect(() => {
    // Clear any previous errors when component mounts
    if (createError) {
      dispatch(clearCreateError());
    }
  }, [dispatch, createError]);

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Gamification Elements */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4 animate-fadeIn">
            Mock Interview Challenge
          </h1>
          <p className="text-lg text-black/70 dark:text-white/70 mb-6 animate-fadeIn">
            Test your skills with AI-powered interview simulation
          </p>
          
          {/* Gamification Stats */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xl font-bold text-purple-400">Level {level}</div>
              <div className="text-xs text-gray-400">Current Level</div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xl font-bold text-cyan-400">{totalXP}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold text-orange-400">{streakCount}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Domain Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
            Choose Your Interview Domain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className={`bg-gradient-to-br ${domain.color} border-2 backdrop-blur-xl rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none shadow-lg animate-fadeIn ${
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
                    <span className={`px-2 py-1 rounded text-white text-xs font-bold ${difficulty.color}`}>
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
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 focus:ring-purple-500"
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
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Interview
              </div>
            ) : (
              "Select Domain & Difficulty First"
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interview Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Be Specific</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Provide detailed answers with examples
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Take Your Time</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Think before answering, quality over speed
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💪</div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Stay Confident</h4>
              <p className="text-sm text-black/70 dark:text-white/70">
                Express your thoughts clearly and confidently
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewSelection;
