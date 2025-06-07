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
    // Fetch questions for the subject if not active
    if (!currentQuiz.isActive && subject) {
      dispatch(fetchQuestionsBySubject(subject));
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Error Loading Questions
        </h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => navigate("/quiz-selection")}
          className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
        >
          Back to Quiz Selection
        </button>
      </div>
    );
  }

  // Check if we have a current question to display
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">No Questions Available</h1>
        <p className="text-gray-600">Please select a different subject.</p>
        <button
          onClick={() => navigate("/quiz-selection")}
          className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
        >
          Back to Quiz Selection
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {subject?.charAt(0).toUpperCase() + subject?.slice(1)} Quiz
            </h1>
            <button
              onClick={handleExitQuiz}
              className="text-white hover:text-red-200"
            >
              Exit Quiz
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p>
              Question {currentQuiz.currentIndex + 1} of{" "}
              {currentQuiz.questions.length}
            </p>{" "}
            <div className="w-48 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
                style={{ width: `${progressInfo.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-purple-300 hover:shadow-md ${
                    selectedOption === index
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        selectedOption === index
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-600"
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
              className={`px-6 py-2.5 rounded-md ${
                currentQuiz.currentIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className={`px-6 py-2.5 rounded-md transition-all ${
                selectedOption === null
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : currentQuiz.currentIndex ===
                    currentQuiz.questions.length - 1
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
    </div>
  );
};

export default Quiz;
