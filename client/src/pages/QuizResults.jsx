import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectQuizResults,
  selectSubmissionLoading,
  selectSubmissionError,
  selectQuizState,
  resetQuiz,
} from "../redux/slices/dqSlice";
import DotLottieLoader from "../components/DotLottieLoader";

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get Redux state
  const reduxResults = useSelector(selectQuizResults);
  const loading = useSelector(selectSubmissionLoading);
  const error = useSelector(selectSubmissionError);
  const quizState = useSelector(selectQuizState);

  // Get results either from Redux or from location state
  const results = reduxResults || location.state?.quizResults;

  const [showDetailedView, setShowDetailedView] = useState(true); // Show by default

  useEffect(() => {
    // Check if we have valid quiz results data to display
    const checkQuizData = () => {
      // First check if we have valid results directly
      if (results && results.success === true) {
        return;
      }

      // Next check if we're still loading results
      if (loading) {
        return;
      }

      // Check if we have a submission error
      if (error) {
        return; // Error state will be handled by error view
      }

      // Check if we came from completing a quiz and have quiz state
      const fromQuiz = location.state?.fromQuiz === true;
      const hasQuizState = quizState?.answers && quizState.answers.length > 0;
      const hasQuizSubject = quizState?.subject;

      // Only redirect if we don't have any valid data source
      if (!fromQuiz && !hasQuizState && !hasQuizSubject) {
        console.error("No valid quiz data found");
        navigate("/quiz-selection", { replace: true });
      }
    };

    checkQuizData();
  }, [
    results,
    loading,
    error,
    quizState,
    location.state,
    navigate,
    reduxResults,
  ]);

  const handleRetakeQuiz = () => {
    dispatch(resetQuiz());
    const subject =
      results?.subject || location.state?.subject || quizState.subject;
    navigate(`/quiz/${subject}`);
  };

  const handleNewQuiz = () => {
    dispatch(resetQuiz());
    navigate("/quiz-selection");
  };

  // Time formatting functions have been removed

  const getPerformanceIcon = (performance) => {
    switch (performance) {
      case "Excellent":
        return (
          <svg
            className="w-8 h-8 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Very Good":
      case "Good":
        return (
          <svg
            className="w-8 h-8 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Average":
        return (
          <svg
            className="w-8 h-8 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <DotLottieLoader
            size="w-12 h-12"
            text="Calculating results..."
            textColor="text-white"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-8 max-w-md">
          <svg
            className="w-12 h-12 text-black dark:text-white mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-black dark:text-white">{error}</p>
          <button
            className="mt-6 py-2 px-6 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-200"
            onClick={handleNewQuiz}
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    );
  }
  if (!results) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-8 max-w-md">
          <svg
            className="w-12 h-12 text-black dark:text-white mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>{" "}
          <p className="mt-4 text-black dark:text-white">
            No quiz results found
          </p>
          <button
            className="mt-6 py-2 px-6 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-200"
            onClick={handleNewQuiz}
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

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

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {" "}
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Results</h1>
          <p className="text-gray-300">{results.subject} Quiz</p>
        </div>
        {/* Score Overview */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-xl p-8 mb-8 shadow-md animate-fadeIn">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getPerformanceIcon(results.performance)}
              <span className="ml-3 text-2xl font-bold text-white">
                {results.performance}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm">Progress</span>
                <span className="text-gray-300 text-sm">
                  {Math.round(
                    (results.correctAnswers / results.totalQuestions) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-gray-700/50 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (results.correctAnswers / results.totalQuestions) * 100
                    }%`,
                    background:
                      results.correctAnswers / results.totalQuestions >= 0.7
                        ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)" // green
                        : "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)", // red
                  }}
                ></div>
              </div>
            </div>{" "}
            <div className="text-6xl font-bold mb-2 text-white animate-fadeIn">
              {results.score}%
            </div>
            <div className="text-xl text-gray-300 mb-6 animate-fadeIn">
              Grade:{" "}
              <span className="font-bold text-white">{results.grade}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {results.correctAnswers}
                </div>{" "}
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {results.summary?.questionsIncorrect ||
                    results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {results.totalQuestions}
                </div>
                <div className="text-sm text-gray-300">Total</div>
              </div>
            </div>
          </div>
        </div>
        {/* Timing Information section has been removed */}
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fadeIn">
          {" "}
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-900 hover:scale-105 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {showDetailedView ? "Hide" : "Show"} Detailed Review
          </button>
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-900 hover:scale-105 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Retake Quiz
          </button>
          <button
            onClick={handleNewQuiz}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-900 hover:scale-105 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            New Quiz
          </button>
        </div>{" "}
        {/* Detailed Results */}
        {showDetailedView && results.detailedResults && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">
              Question by Question Review ({results.detailedResults.length}{" "}
              questions)
            </h2>
            {results.detailedResults.map((result, index) => (
              <div
                key={result.questionId}
                className={`bg-black/5 dark:bg-white/5 border rounded-xl p-6 shadow-md transition-transform duration-300 animate-fadeIn ${
                  result.isCorrect ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-black/70 dark:text-white/70 mr-3">
                        Question {index + 1}
                      </span>
                      {result.isCorrect ? (
                        <div className="flex items-center text-green-500">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">Incorrect</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                      {result.question}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.options.map((option, optionIndex) => {
                    const isUserSelected =
                      optionIndex === result.userSelectedOption;
                    const isCorrect = optionIndex === result.correctOption;
                    let bgColor =
                      "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10";
                    let textColor = "text-black dark:text-white";
                    if (isCorrect) {
                      bgColor = "bg-green-500 border-green-700";
                      textColor = "text-white font-bold";
                    } else if (isUserSelected && !isCorrect) {
                      bgColor = "bg-red-500 border-red-700";
                      textColor = "text-white font-bold";
                    }
                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${bgColor} transition-all duration-200 animate-fadeIn`}
                      >
                        <div className="flex items-center">
                          <span
                            className={`text-sm font-medium mr-3 ${textColor}`}
                          >
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className={textColor + " whitespace-pre-line"}>
                            {option}
                          </span>
                          <div className="ml-auto flex items-center space-x-2">
                            {/* Removed 'Correct Answer' and 'Your Answer' badges from red and green boxes for cleaner look */}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
