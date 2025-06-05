import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  submitQuizAnswers,
  selectQuizResults,
  selectSubmissionLoading,
  selectSubmissionError,
  selectQuizState,
} from "../redux/slices/dqSlice";

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get Redux state
  const results = useSelector(selectQuizResults);
  const loading = useSelector(selectSubmissionLoading);
  const error = useSelector(selectSubmissionError);
  const quizState = useSelector(selectQuizState);

  useEffect(() => {
    const processResults = async () => {
      // Check if we have the required data from Redux state or location
      const answers = location.state?.answers || quizState.answers;
      const questions = location.state?.questions || quizState.questions;
      const subject = location.state?.subject || quizState.subject;

      if (!answers || !questions || !subject) {
        console.error("Missing quiz data. Please try again.");
        return;
      }

      // Submit answers using Redux thunk
      dispatch(submitQuizAnswers({ answers, subject, questions }));
    };

    // Only process if we don't already have results
    if (!results) {
      processResults();
    }
  }, [dispatch, location.state, quizState, results]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Calculating results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            className="mt-6 py-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg"
            onClick={() => navigate("/quiz-selection")}
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Quiz Results
            </h1>
            <button
              onClick={() => navigate("/quiz-selection")}
              className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Try Another Quiz
            </button>
          </div>
          <p className="mt-2 text-gray-400">
            {results.subject} • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Your Score</h2>

          <div className="w-32 h-32 mx-auto relative flex items-center justify-center my-6">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2.5"
                strokeDasharray={`${results.score}, 100`}
                className="animate-dashoffset"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {results.score}%
              </span>
            </div>
          </div>

          <p className="text-white mb-1">
            You got{" "}
            <span className="text-cyan-400 font-semibold">
              {results.correctAnswers}
            </span>{" "}
            out of{" "}
            <span className="font-semibold">{results.totalQuestions}</span>{" "}
            questions right
          </p>

          <p
            className={`text-sm font-medium ${
              results.score >= 80
                ? "text-green-400"
                : results.score >= 60
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {results.score >= 80
              ? "Excellent! Great job!"
              : results.score >= 60
              ? "Good work! Room for improvement."
              : "Keep practicing to improve your score."}
          </p>
        </div>

        {/* Question Review - temporarily disabled since we don't have correct answers */}
        {/* This would require the backend to return the correct answers */}
        {/*
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Question Review</h2>
          
          <div className="space-y-6">
            {results.questions.map((question, qIndex) => {
              const answer = results.answers[qIndex];
              const isCorrect = // We would need to check with the correct answer
              
              return (
                <div key={question.id} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 mr-2 flex-shrink-0 ${
                      isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isCorrect ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-white font-medium flex-grow">{question.question}</h3>
                  </div>
                  
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400">Your answer: </span>
                      <span className={`ml-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {question.options[answer.selectedOption]}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-400">Correct answer: </span>
                        <span className="ml-2 text-green-400">
                          Correct answer would be displayed here
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        */}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <button
            onClick={() => navigate("/quiz-selection")}
            className="py-2.5 px-6 rounded-lg font-medium border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 flex-1"
          >
            Try Another Quiz
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="py-2.5 px-6 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex-1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
