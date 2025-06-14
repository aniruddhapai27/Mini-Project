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
  selectSubjectQuestions,
  nextQuestion,
  previousQuestion,
  selectAnswer,
  finishQuiz,
  startQuiz,
  resetQuiz,
  submitQuizAnswers,
} from "../redux/slices/dqSlice";

const Quiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Redux state
  const currentQuiz = useSelector(selectCurrentQuiz);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const progressInfo = useSelector(selectQuizProgress);
  const loading = useSelector(selectSubjectQuestionsLoading);
  const error = useSelector(selectSubjectQuestionsError);
  const subjectQuestions = useSelector(selectSubjectQuestions);

  // Local state for current question's selected option
  const [selectedOption, setSelectedOption] = useState(null);

  // Get current user answer for the current question
  const userAnswer = useSelector((state) =>
    selectUserAnswer(state, currentQuiz.currentIndex)
  );

  // Check if this is an unauthorized direct navigation
  useEffect(() => {
    // If there's no subject, redirect to quiz selection
    if (!subject) {
      navigate("/quiz-selection");
      return;
    }
  }, [subject, navigate]);

  useEffect(() => {
    // If questions for this subject are already in localStorage, use them
    const cacheKey = `quiz-questions-${subject}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        dispatch(startQuiz({ questions: parsed, subject }));
        return;
      }
    }
    // Fetch questions for the subject if not active
    if (!currentQuiz.isActive && subject) {
      dispatch(fetchQuestionsBySubject(subject)).then((action) => {
        if (action.payload && Array.isArray(action.payload)) {
          localStorage.setItem(cacheKey, JSON.stringify(action.payload));
        }
      });
    }
  }, [dispatch, subject, currentQuiz.isActive]);

  useEffect(() => {
    // Start quiz when questions are loaded
    if (subjectQuestions.length > 0 && !currentQuiz.isActive && subject) {
      dispatch(startQuiz({ questions: subjectQuestions, subject }));
    }

    // If no questions are available after a timeout, redirect back to selection
    const timer = setTimeout(() => {
      if (subjectQuestions.length === 0 && !loading && !currentQuiz.isActive) {
        navigate("/quiz-selection");
      }
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timer);
  }, [
    subjectQuestions,
    loading,
    currentQuiz.isActive,
    subject,
    dispatch,
    navigate,
  ]);
  // Clean up when leaving the quiz page without completing
  useEffect(() => {
    return () => {
      // If quiz is still active when leaving, reset it
      if (currentQuiz.isActive) {
        dispatch(resetQuiz());
      }
    };
  }, [currentQuiz.isActive, dispatch]);
  useEffect(() => {
    // Set the selected option to the user's answer if one exists
    if (userAnswer !== null) {
      setSelectedOption(userAnswer);
    } else {
      setSelectedOption(null);
    }
  }, [userAnswer, currentQuiz.currentIndex]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    dispatch(
      selectAnswer({
        questionIndex: currentQuiz.currentIndex,
        selectedOption: optionIndex,
      })
    );
  };

  const handleNextQuestion = () => {
    // Only allow next if an answer is selected
    if (selectedOption !== null) {
      if (currentQuiz.currentIndex === currentQuiz.questions.length - 1) {
        // Last question - finish quiz
        handleFinishQuiz();
      } else {
        dispatch(nextQuestion());
      }
    }
  };
  const handlePreviousQuestion = () => {
    dispatch(previousQuestion());
  };
  const handleFinishQuiz = async () => {
    dispatch(finishQuiz());

    try {
      // Check if we have all answers
      if (currentQuiz.answers.length !== currentQuiz.questions.length) {
        console.warn(`Not all questions answered: 
          ${currentQuiz.answers.length} answers for ${currentQuiz.questions.length} questions`);
      }

      // Format answers for backend submission
      const formattedAnswers = currentQuiz.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        questionIndex: answer.questionIndex,
      }));

      console.log("Submitting answers:", formattedAnswers);

      // Submit the quiz answers
      const resultAction = await dispatch(
        submitQuizAnswers({
          answers: formattedAnswers,
          subject: currentQuiz.subject,
          questions: currentQuiz.questions,
        })
      ).unwrap();

      // Validate the results
      if (resultAction && resultAction.success) {
        console.log("Quiz submission successful:", resultAction);
        navigate("/quiz-results", {
          state: {
            fromQuiz: true,
            quizResults: resultAction,
          },
        });
      } else {
        throw new Error(
          resultAction?.message || "Failed to process quiz results"
        );
      }
    } catch (error) {
      console.error("Failed to submit quiz answers:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  const handleExitQuiz = () => {
    // Reset quiz state
    dispatch(resetQuiz());
    navigate("/quiz-selection");
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 shadow-xl max-w-md">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
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
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={handleExitQuiz}
            className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 border border-cyan-500/30 shadow-lg"
          >
            Back to Quiz Selection
          </button>
        </div>      </div>
    );
  }

  // Check if we have a current question to display
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl p-8 shadow-xl max-w-md">
          <svg
            className="w-12 h-12 text-yellow-400 mx-auto mb-4"
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
          <h1 className="text-xl font-bold text-white mb-2">No Questions Available</h1>
          <p className="text-gray-300 mb-4">Please select a different subject.</p>
          <button
            onClick={() => navigate("/quiz-selection")}
            className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 border border-cyan-500/30 shadow-lg"
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto bg-black/5 dark:bg-white/5 shadow-2xl rounded-2xl overflow-hidden animate-fadeIn">
        {/* Quiz Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-black">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2 md:mb-0">
            {subject?.charAt(0).toUpperCase() + subject?.slice(1)} Quiz
          </h1>
          <button
            onClick={handleExitQuiz}
            className="text-black dark:text-white hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors"
          >
            Exit Quiz
          </button>
        </div>
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-black/70 dark:text-white/70 text-sm">
              Question {currentQuiz.currentIndex + 1} of {currentQuiz.questions.length}
            </span>
            <span className="text-black/70 dark:text-white/70 text-sm">
              {Math.round(progressInfo.percentage)}%
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
            <div
              className="bg-black dark:bg-white h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressInfo.percentage}%` }}
            ></div>
          </div>
        </div>
        {/* Quiz Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white animate-fadeIn">
              {currentQuestion?.question}
            </h2>
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:border-black dark:hover:border-white hover:shadow-lg animate-fadeIn ${
                    selectedOption === index
                      ? "border-black dark:border-white bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-md scale-105"
                      : "border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 font-bold text-base transition-all duration-200 ${
                        selectedOption === index
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuiz.currentIndex === 0}
              className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 animate-fadeIn ${
                currentQuiz.currentIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20 hover:scale-105"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 animate-fadeIn ${
                selectedOption === null
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : currentQuiz.currentIndex === currentQuiz.questions.length - 1
                  ? "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
                  : "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
              }`}
            >
              {currentQuiz.currentIndex === currentQuiz.questions.length - 1
                ? "Finish Quiz"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
