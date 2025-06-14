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

  const [showDetailedView, setShowDetailedView] = useState(false);
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
  }, [results, loading, error, quizState, location.state, navigate]);

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

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Calculating results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 border border-red-700/30 rounded-xl p-8 max-w-md">
          <svg
            className="w-12 h-12 text-red-400 mx-auto"
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
          <p className="mt-4 text-red-400">{error}</p>
          <button
            className="mt-6 py-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 border border-yellow-700/30 rounded-xl p-8 max-w-md">
          <svg
            className="w-12 h-12 text-yellow-400 mx-auto"
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
          </svg>
          <p className="mt-4 text-yellow-400">No quiz results found</p>
          <button
            className="mt-6 py-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            onClick={handleNewQuiz}
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Results</h1>
          <p className="text-gray-400">{results.subject} Quiz</p>
        </div>

        {/* Score Overview */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getPerformanceIcon(results.performance)}
              <span className="ml-3 text-2xl font-bold text-white">
                {results.performance}
              </span>
            </div>

            <div
              className={`text-6xl font-bold mb-2 ${getScoreColor(
                results.score
              )}`}
            >
              {results.score}%
            </div>

            <div className="text-xl text-gray-300 mb-6">
              Grade:{" "}
              <span className={`font-bold ${getScoreColor(results.score)}`}>
                {results.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {results.correctAnswers}
                </div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {results.summary?.questionsIncorrect ||
                    results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-gray-400">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {results.totalQuestions}
                </div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            {showDetailedView ? "Hide" : "Show"} Detailed Review
          </button>
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            Retake Quiz
          </button>
          <button
            onClick={handleNewQuiz}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            New Quiz
          </button>
        </div>

        {/* Detailed Results */}
        {showDetailedView && results.detailedResults && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Question by Question Review
            </h2>

            {results.detailedResults.map((result, index) => (
              <div
                key={result.questionId}
                className={`bg-gray-800/50 border rounded-xl p-6 ${
                  result.isCorrect ? "border-green-500/30" : "border-red-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-400 mr-3">
                        Question {index + 1}
                      </span>
                      {result.isCorrect ? (
                        <div className="flex items-center text-green-400">
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
                        <div className="flex items-center text-red-400">
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
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {result.question}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.options.map((option, optionIndex) => {
                    const isUserSelected =
                      optionIndex === result.userSelectedOption;
                    const isCorrect = optionIndex === result.correctOption;

                    let bgColor = "bg-gray-700/30 border-gray-600";
                    let textColor = "text-gray-300";

                    if (isCorrect) {
                      bgColor = "bg-green-500/20 border-green-500";
                      textColor = "text-green-400";
                    } else if (isUserSelected && !isCorrect) {
                      bgColor = "bg-red-500/20 border-red-500";
                      textColor = "text-red-400";
                    }

                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${bgColor}`}
                      >
                        <div className="flex items-center">
                          <span
                            className={`text-sm font-medium mr-3 ${textColor}`}
                          >
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className={textColor}>{option}</span>
                          <div className="ml-auto flex items-center space-x-2">
                            {isCorrect && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                Correct Answer
                              </span>
                            )}
                            {isUserSelected && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isCorrect
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                Your Answer
                              </span>
                            )}
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
