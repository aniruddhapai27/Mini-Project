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
  startQuiz,
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

  useEffect(() => {
    // If quiz is not active, try to start it
    if (!currentQuiz.isActive) {
      if (subject) {
        dispatch(fetchQuestionsBySubject(subject));
      }
    } else {
      // Update selected option when question changes
      const userAnswer = useSelector(state => selectUserAnswer(state, currentQuiz.currentIndex));
      setSelectedOption(userAnswer);
    }
  }, [dispatch, subject, currentQuiz.isActive, currentQuiz.currentIndex]);

  // Handle when questions are fetched, start the quiz
  useEffect(() => {
    if (!currentQuiz.isActive && !loading && !error) {
      // This will be handled by the Redux state when fetchQuestionsBySubject succeeds
    }
  }, [currentQuiz.isActive, loading, error]);
  }, [subject, location.state]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    // Save the answer
    const newAnswers = [...answers];
    const currentQuestion = questions[currentIndex];

    newAnswers[currentIndex] = {
      questionId: currentQuestion._id || currentQuestion.id,
      questionNum: currentQuestion.questionNum,
      selectedOption,
    };

    setAnswers(newAnswers);
    setSelectedOption(null);

    // Move to next question or finish quiz
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz completed, navigate to results page
      navigate("/quiz-results", {
        state: {
          answers: newAnswers,
          questions,
          subject,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading questions...</p>
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
            Back to Subject Selection
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-8">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-4 text-gray-300">
            No questions available for this subject.
          </p>
          <button
            className="mt-6 py-2 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg"
            onClick={() => navigate("/quiz-selection")}
          >
            Back to Subject Selection
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {subject} Quiz
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
              Back to Selection
            </button>
          </div>
          <p className="mt-2 text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
            <div
              className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2.5 rounded-full"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedOption === index
                    ? "bg-cyan-500/30 border-cyan-500/50 border-2"
                    : "bg-gray-700/50 border border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                      selectedOption === index
                        ? "bg-cyan-500 text-white"
                        : "border border-gray-500 text-gray-500"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div></div> {/* Empty div for spacing */}
          <button
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            className={`py-2.5 px-8 rounded-lg font-medium transition-all duration-300 ${
              selectedOption !== null
                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/20"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentIndex < questions.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
