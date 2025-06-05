import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuestionsBySubject,
  selectCurrentQuiz,
  selectCurrentQuestion,
  selectQuizProgress,
  selectUserAnswer,
  selectSubjectQuestionsLoading,
  selectSubjectQuestionsError,
  nextQuestion,
  previousQuestion,
  selectAnswer,
  finishQuiz,
} from "../redux/slices/dqSlice";

const Quiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const currentQuiz = useSelector(selectCurrentQuiz);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const progress = useSelector(selectQuizProgress);
  const loading = useSelector(selectSubjectQuestionsLoading);
  const error = useSelector(selectSubjectQuestionsError);
  // Local state for current question's selected option
  const [selectedOption, setSelectedOption] = useState(null);

  // Get current user answer for the current question
  const userAnswer = useSelector((state) =>
    selectUserAnswer(state, currentQuiz.currentIndex)
  );

  useEffect(() => {
    // If quiz is not active, try to start it
    if (!currentQuiz.isActive && subject) {
      dispatch(fetchQuestionsBySubject(subject));
    }
  }, [dispatch, subject, currentQuiz.isActive]);

  useEffect(() => {
    // Update selected option when question changes
    if (currentQuiz.isActive && currentQuestion) {
      setSelectedOption(userAnswer);
    }
  }, [
    currentQuiz.currentIndex,
    currentQuestion,
    currentQuiz.isActive,
    userAnswer,
  ]);

  // Handle question selection
  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    dispatch(
      selectAnswer({
        questionIndex: currentQuiz.currentIndex,
        selectedOption: optionIndex,
      })
    );
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
      dispatch(nextQuestion());
    } else {
      // Quiz completed, navigate to results
      handleFinishQuiz();
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuiz.currentIndex > 0) {
      dispatch(previousQuestion());
    }
  };

  // Handle quiz completion
  const handleFinishQuiz = () => {
    dispatch(finishQuiz());
    navigate("/quiz-results", {
      state: {
        answers: currentQuiz.answers,
        questions: currentQuiz.questions,
        subject: currentQuiz.subject,
      },
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // No active quiz state
  if (!currentQuiz.isActive || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="mt-4 text-yellow-400">No quiz questions available</p>
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {currentQuiz.subject} Quiz
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Exit Quiz
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>
              Question {progress.current} of {progress.total}
            </span>
            <span>{Math.round(progress.percentage)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                  selectedOption === index
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedOption === index
                        ? "border-cyan-500 bg-cyan-500"
                        : "border-gray-500"
                    }`}
                  >
                    {selectedOption === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuiz.currentIndex === 0}
            className={`py-2.5 px-6 rounded-lg font-medium transition-all duration-300 ${
              currentQuiz.currentIndex === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`py-2.5 px-6 rounded-lg font-medium transition-all duration-300 ${
              selectedOption === null
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : currentQuiz.currentIndex === currentQuiz.questions.length - 1
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/20"
                : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/20"
            }`}
          >
            {currentQuiz.currentIndex === currentQuiz.questions.length - 1
              ? "Finish Quiz"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
