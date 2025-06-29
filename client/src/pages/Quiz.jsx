import { useState, useEffect, useCallback, useRef } from "react";
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
  resetForNewSubject,
  submitQuizAnswers,
} from "../redux/slices/dqSlice";
import DotLottieLoader from "../components/DotLottieLoader";

const Quiz = () => {
  const { subject: encodedSubject } = useParams();
  const subject = encodedSubject ? decodeURIComponent(encodedSubject) : null;
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
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const [startTime, setStartTime] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState([]);
  const currentQuestionStartTimeRef = useRef(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Get current user answer for the current question
  const userAnswer = useSelector((state) =>
    selectUserAnswer(state, currentQuiz.currentIndex)
  );

  // Helper function to format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to get timer color based on remaining time
  const getTimerColor = () => {
    if (timeLeft > 40) return 'text-green-400 border-green-400';
    if (timeLeft > 20) return 'text-yellow-400 border-yellow-400 animate-timer-pulse';
    return 'text-red-400 border-red-400 animate-timer-critical';
  };

  // Function to clear quiz cache for all subjects
  const clearQuizCache = () => {
    const subjects = ['data structures', 'operating systems', 'computer networks', 'database management systems', 'software engineering', 'algorithm design and analysis'];
    subjects.forEach(subj => {
      localStorage.removeItem(`quiz-questions-${subj}`);
      localStorage.removeItem(`quiz-questions-${subj}-v1`);
      localStorage.removeItem(`quiz-questions-${subj}-v2`);
    });
  };

  // Check if this is an unauthorized direct navigation or subject change
  useEffect(() => {
    // If there's no subject, redirect to quiz selection
    if (!subject) {
      navigate("/quiz-selection");
      return;
    }

    // Reset quiz state when subject changes
    if (currentQuiz.subject && currentQuiz.subject !== subject) {
      console.log(`Subject changed from ${currentQuiz.subject} to ${subject}, resetting quiz`);
      dispatch(resetForNewSubject());
      clearQuizCache();
    }
  }, [subject, navigate, currentQuiz.subject, dispatch]);  useEffect(() => {
    // Only proceed if we have a valid subject and no active quiz
    if (!subject) return;

    // If there's an active quiz for a different subject, reset it first
    if (currentQuiz.isActive && currentQuiz.subject !== subject) {
      dispatch(resetQuiz());
      return;
    }

    // Use a versioned cache key to force cache refresh after the 10-question fix
    const cacheKey = `quiz-questions-${subject}-v2`;
    const cached = localStorage.getItem(cacheKey);
    
    // Clear old cache versions for this subject
    localStorage.removeItem(`quiz-questions-${subject}`);
    localStorage.removeItem(`quiz-questions-${subject}-v1`);
    
    // Only use cache if we don't have an active quiz and the cache is for the current subject
    if (cached && !currentQuiz.isActive) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 10) {
          // Verify that cached questions are for the current subject
          const isCorrectSubject = parsed.every(q => 
            q.subject && q.subject.toLowerCase() === subject.toLowerCase()
          );
          
          if (isCorrectSubject) {
            dispatch(startQuiz({ questions: parsed, subject }));
            return;
          } else {
            // Cache is for wrong subject, remove it
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.error('Error parsing cached questions:', error);
        localStorage.removeItem(cacheKey);
      }
    }
    
    // Fetch questions for the subject if not active or cache is invalid
    if (!currentQuiz.isActive && subject) {
      dispatch(fetchQuestionsBySubject(subject)).then((action) => {
        if (action.payload && action.payload.questions && Array.isArray(action.payload.questions)) {
          // Ensure exactly 10 questions before caching
          const limitedQuestions = action.payload.questions.slice(0, 10);
          // Only cache if questions are for the correct subject
          if (limitedQuestions.length > 0 && limitedQuestions[0].subject) {
            localStorage.setItem(cacheKey, JSON.stringify(limitedQuestions));
          }
        }
      });
    }  }, [dispatch, subject, currentQuiz.isActive, currentQuiz.subject, subjectQuestions.length]);

  // Define handleFinishQuiz before it's used in useEffect
  const handleFinishQuiz = useCallback(async () => {
    // Set finishing state to prevent UI flickering
    setIsFinishing(true);
    
    // Record time spent on last question
    if (currentQuestionStartTimeRef.current) {
      const now = Date.now();
      const timeSpent = now - currentQuestionStartTimeRef.current;
      setTimePerQuestion(prev => {
        const updated = [...prev];
        updated[currentQuiz.currentIndex] = timeSpent;
        return updated;
      });
    }
    
    // First, mark the quiz as inactive to prevent UI flickering
    dispatch(finishQuiz());

    try {
      // Check if we have all answers
      if (currentQuiz.answers.length !== currentQuiz.questions.length) {
        console.warn(`Not all questions answered: 
          ${currentQuiz.answers.length} answers for ${currentQuiz.questions.length} questions`);
      }

      // Calculate total time taken
      const totalTime = startTime ? Date.now() - startTime : 0;

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
          totalTime,
          timePerQuestion,
        })
      ).unwrap();

      // Validate the results
      if (resultAction && resultAction.success) {
        console.log("Quiz submission successful:", resultAction);
        
        navigate("/quiz-results", {
          state: {
            fromQuiz: true,
            quizResults: {
              ...resultAction,
              totalTime,
              timePerQuestion,
              timeTaken: Math.floor(totalTime / 1000), // in seconds
            },
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
      setIsFinishing(false); // Reset finishing state on error
    }
  }, [currentQuiz, dispatch, navigate, startTime, timePerQuestion]);

  useEffect(() => {
    // Start quiz when questions are loaded and we don't have an active quiz
    if (subjectQuestions.length > 0 && !currentQuiz.isActive && subject) {
      // Double-check that the loaded questions are for the current subject
      const questionsForCurrentSubject = subjectQuestions.filter(q => 
        q.subject && q.subject.toLowerCase() === subject.toLowerCase()
      );
      
      if (questionsForCurrentSubject.length > 0) {
        dispatch(startQuiz({ questions: questionsForCurrentSubject, subject }));
      } else {
        // Questions don't match current subject, fetch new ones
        dispatch(fetchQuestionsBySubject(subject));
      }
    }

    // If no questions are available after a timeout, redirect back to selection
    const timer = setTimeout(() => {
      if (subjectQuestions.length === 0 && !loading && !currentQuiz.isActive && subject) {
        console.log('No questions found for subject:', subject);
        navigate("/quiz-selection");
      }
    }, 5000); // Increased timeout to 5 seconds

    return () => clearTimeout(timer);
  }, [
    subjectQuestions,
    loading,
    currentQuiz.isActive,
    subject,
    dispatch,
    navigate,
    error,
  ]);
  // Timer useEffect - countdown and auto-submit
  useEffect(() => {
    if (!currentQuiz.isActive || isFinishing) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up! Auto-submit the quiz
          handleFinishQuiz();
          return 0;
        }
        
        // Show warning at 20 seconds
        if (prevTime === 21) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 4000); // Hide after 4 seconds
        }
        
        // Show final warning at 10 seconds
        if (prevTime === 11) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 3000); // Hide after 3 seconds
        }
        
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuiz.isActive, isFinishing, handleFinishQuiz]);

  // Start timer when quiz becomes active
  useEffect(() => {
    if (currentQuiz.isActive && !startTime) {
      const now = Date.now();
      setStartTime(now);
      currentQuestionStartTimeRef.current = now;
      setTimeLeft(120); // Reset timer to 2 minutes
    }
  }, [currentQuiz.isActive, startTime]);

  // Track time per question when question changes
  useEffect(() => {
    if (currentQuiz.isActive && currentQuestionStartTimeRef.current) {
      const now = Date.now();
      const timeSpent = now - currentQuestionStartTimeRef.current;
      
      if (currentQuiz.currentIndex > 0) {
        setTimePerQuestion(prev => {
          const updated = [...prev];
          updated[currentQuiz.currentIndex - 1] = timeSpent;
          return updated;
        });
      }
      
      currentQuestionStartTimeRef.current = now;
    }
  }, [currentQuiz.currentIndex, currentQuiz.isActive]);

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

  const handleExitQuiz = () => {
    // Clear quiz cache to prevent stale data
    clearQuizCache();
    // Reset quiz state
    dispatch(resetQuiz());
    navigate("/quiz-selection");
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <DotLottieLoader 
            size="w-12 h-12"
            text="Loading quiz..."
            textColor="text-white"
          />
        </div>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-8 shadow-xl">
          <DotLottieLoader 
            size="w-12 h-12"
            text="Processing quiz results..."
            textColor="text-white"
          />
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
            className="group relative py-3 px-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-cyan-200 rounded-lg font-semibold border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <div className="flex items-center space-x-2">
              <svg 
                className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
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
              <span>Back to Quiz Selection</span>
            </div>
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        </div>      </div>
    );
  }

  // Check if we have a current question to display and it matches the current subject
  if (!currentQuestion || !currentQuiz.isActive) {
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
          <h1 className="text-xl font-bold text-white mb-2">
            {!currentQuiz.isActive ? "Quiz Completed" : "No Questions Available"}
          </h1>
          <p className="text-gray-300 mb-4">
            {!currentQuiz.isActive ? "Redirecting to results..." : "Please select a different subject."}
          </p>
          <button
            onClick={() => navigate("/quiz-selection")}
            className="group relative py-3 px-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-cyan-200 rounded-lg font-semibold border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <div className="flex items-center space-x-2">
              <svg 
                className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
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
              <span>Back to Quiz Selection</span>
            </div>
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        </div>
      </div>
    );
  }

  // Additional safety check: ensure current question belongs to current subject
  if (currentQuestion && currentQuestion.subject && subject && 
      currentQuestion.subject.toLowerCase() !== subject.toLowerCase()) {
    console.log(`Question subject mismatch: ${currentQuestion.subject} !== ${subject}, resetting...`);
    dispatch(resetForNewSubject());
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <DotLottieLoader 
            size="w-12 h-12"
            text="Loading quiz..."
            textColor="text-white"
          />
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-8">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle Black Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-900/20 to-black rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-gray-800/15 to-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-700/10 to-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
          {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagon" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon fill="none" stroke="white" strokeWidth="0.5" points="30,1 52.5,14 52.5,40 30,53 7.5,40 7.5,14"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagon)" />
          </svg>
        </div>
          {/* Geometric Floating Shapes - Pure Black/Gray */}
        <div className="absolute top-16 left-16 w-4 h-4 bg-gray-800/40 rotate-45 animate-float-slow"></div>
        <div className="absolute top-24 right-24 w-3 h-3 bg-gray-700/30 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-24 left-24 w-2 h-2 bg-gray-600/35 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-16 right-16 w-5 h-5 bg-gray-800/30 animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-8 bg-gray-700/25 animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/3 w-8 h-1 bg-gray-600/25 animate-float-fast"></div>
        
        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0,40 L20,40 M60,40 L80,40 M40,0 L40,20 M40,60 L40,80" stroke="white" strokeWidth="0.5" fill="none"/>
                <circle cx="20" cy="40" r="2" fill="white" opacity="0.3"/>
                <circle cx="60" cy="40" r="2" fill="white" opacity="0.3"/>
                <circle cx="40" cy="20" r="2" fill="white" opacity="0.3"/>
                <circle cx="40" cy="60" r="2" fill="white" opacity="0.3"/>
                <rect x="35" y="35" width="10" height="10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
        
        {/* Subtle Gradient Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-700/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gray-600/15 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-0 top-1/4 w-full h-px bg-gradient-to-r from-transparent via-gray-700/20 to-transparent animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-0 bottom-1/3 w-full h-px bg-gradient-to-r from-transparent via-gray-600/15 to-transparent animate-pulse" style={{ animationDelay: "3s" }}></div>      </div>

      {/* Time Warning Modal */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-red-500/90 backdrop-blur-xl border-2 border-red-400 rounded-2xl p-8 shadow-xl animate-bounce max-w-md mx-4">
            <div className="text-center">
              <svg className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">⚠️ Time Warning!</h2>
              <p className="text-white/90 text-lg">
                {timeLeft > 15 ? 'Only 20 seconds remaining!' : 'Only 10 seconds remaining!'}
              </p>
              <p className="text-white/80 text-sm mt-2">Quiz will auto-submit when time runs out</p>
              <div className="mt-4 text-white font-mono text-xl animate-pulse">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Container */}
      <div className="w-full max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden animate-fadeIn relative z-10 border border-white/10">
        {/* Container Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-gray-500/5 rounded-2xl pointer-events-none"></div>
        
        {/* Quiz Header */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center bg-gray-800/50 backdrop-blur-sm relative">
          <h1 className="text-2xl font-bold text-white mb-2 md:mb-0 drop-shadow-lg">
            {subject?.charAt(0).toUpperCase() + subject?.slice(1)} Quiz
          </h1>
          
          {/* Timer Display */}
          <div className={`flex items-center space-x-4 ${getTimerColor()}`}>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-bold font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={handleExitQuiz}
              className="group relative px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 hover:text-red-200 font-semibold rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-4 h-4 transition-transform group-hover:rotate-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                <span>Exit Quiz</span>
              </div>
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pt-4 bg-gray-800/30 backdrop-blur-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              Question {currentQuiz.currentIndex + 1} of {currentQuiz.questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-white/80 text-sm">
                {Math.round(progressInfo.percentage)}%
              </span>
              {/* Circular Timer */}
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-white/20"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                  />
                  <path
                    className={`stroke-current ${getTimerColor().split(' ')[0]}`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${(timeLeft / 120) * 100} 100`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dasharray 1s ease-in-out'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${getTimerColor().split(' ')[0]}`}>
                    {Math.ceil(timeLeft / 60)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-gray-400 to-white h-2.5 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progressInfo.percentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Quiz Content */}
        <div className="p-6 bg-gray-800/30 backdrop-blur-sm relative">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white animate-fadeIn drop-shadow-lg">
              {currentQuestion?.question}
            </h2>
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
                    selectedOption === index
                      ? "bg-white/20 border-white/40 shadow-lg shadow-white/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="flex items-center w-full">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 font-bold text-base transition-all duration-200 ${
                        selectedOption === index
                          ? "bg-white text-black shadow-lg"
                          : "bg-white/20 text-white/70"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-white/90">{option}</span>
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
              className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 animate-fadeIn backdrop-blur-sm ${
                currentQuiz.currentIndex === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 animate-fadeIn backdrop-blur-sm ${
                selectedOption === null
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : currentQuiz.currentIndex === currentQuiz.questions.length - 1
                  ? "bg-white text-black hover:scale-105 shadow-lg"
                  : "bg-white text-black hover:scale-105 shadow-lg"
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
