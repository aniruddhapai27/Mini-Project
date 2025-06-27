import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDailyQuestions,
  selectDailyQuestions,
  selectDailyQuestionsLoading,
  selectDailyQuestionsError,
  clearDailyQuestionsError,
  resetQuiz,
} from "../redux/slices/dqSlice";
import { subjectImages } from "../assets/subjectImages";

const QuizSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const dailyQuestions = useSelector(selectDailyQuestions);
  const loading = useSelector(selectDailyQuestionsLoading);
  const error = useSelector(selectDailyQuestionsError);

  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    // Reset any existing quiz state when coming to the selection page
    dispatch(resetQuiz());

    // Fetch the daily questions
    dispatch(fetchDailyQuestions());
  }, [dispatch]);

  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
  };

  const handleStartQuiz = () => {
    if (!selectedSubject) {
      alert("Please select a subject to start the quiz.");
      return;
    }
    
    console.log('Starting quiz for subject:', selectedSubject);
    
    // Clear any existing quiz cache to prevent stale data
    const subjects = ['data structures', 'operating systems', 'computer networks', 'database management systems', 'software engineering', 'algorithm design and analysis'];
    subjects.forEach(subj => {
      if (subj !== selectedSubject.toLowerCase()) {
        localStorage.removeItem(`quiz-questions-${subj}`);
        localStorage.removeItem(`quiz-questions-${subj}-v1`);
        localStorage.removeItem(`quiz-questions-${subj}-v2`);
      }
    });
    
    // URL encode the subject to handle spaces and special characters
    const encodedSubject = encodeURIComponent(selectedSubject);
    console.log('Navigating to:', `/quiz/${encodedSubject}`);
    
    navigate(`/quiz/${encodedSubject}`);
  };

  const getSubjectsFromQuestions = () => {
    if (!dailyQuestions || !Array.isArray(dailyQuestions)) return [];

    const subjects = [...new Set(dailyQuestions.map((q) => q.subject))];
    return subjects;
  };

  const getQuestionCountBySubject = (subject) => {
    if (!dailyQuestions || !Array.isArray(dailyQuestions)) return 0;
    return dailyQuestions.filter((q) => q.subject === subject).length;
  };  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Pure Black Geometric Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating Shapes */}
          <div className="absolute top-16 left-16 w-4 h-4 bg-white opacity-10 rotate-45 animate-float-slow"></div>
          <div className="absolute top-24 right-24 w-6 h-6 bg-gray-300 opacity-15 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-20 rotate-45 animate-float-fast"></div>
        </div>

        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-gray-500/30 rounded-2xl p-8 shadow-xl relative z-10">
          <div className="w-12 h-12 border-4 border-t-gray-500 border-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading quiz subjects...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Pure Black Geometric Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating Shapes */}
          <div className="absolute top-16 left-16 w-4 h-4 bg-white opacity-10 rotate-45 animate-float-slow"></div>
          <div className="absolute top-24 right-24 w-6 h-6 bg-gray-300 opacity-15 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-20 rotate-45 animate-float-fast"></div>
        </div>

        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 max-w-md shadow-xl relative z-10">
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
            className="py-2 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-300 border border-gray-500/30 shadow-lg"
            onClick={() => {
              dispatch(clearDailyQuestionsError());
              dispatch(fetchDailyQuestions());
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const subjects = getSubjectsFromQuestions();
  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-8">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon fill="none" stroke="white" strokeWidth="1" points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="20" y="20" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="30" cy="10" r="2" fill="white" opacity="0.3"/>
                <circle cx="50" cy="30" r="2" fill="white" opacity="0.3"/>
                <circle cx="30" cy="50" r="2" fill="white" opacity="0.3"/>
                <circle cx="10" cy="30" r="2" fill="white" opacity="0.3"/>
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
              <pattern id="diamonds" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-0 top-1/5 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-gray-400/15 to-transparent animate-pulse" style={{ animationDelay: "3s" }}></div>

        {/* Particle System */}
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-white opacity-40 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-gray-300 opacity-50 rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white opacity-60 rounded-full animate-ping" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fadeIn">
            Daily Quiz Challenge
          </h1>
          <p className="text-gray-300 text-lg animate-fadeIn">
            Choose your subject and test your knowledge
          </p>
        </div>
        {/* Subject Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center animate-fadeIn">
            Select a Subject
          </h2>
          {subjects.length === 0 ? (
            <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-gray-500/30 rounded-2xl p-8 animate-fadeIn shadow-xl">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-300">
                No quiz questions available for today.
              </p>
            </div>
          ) : (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {subjects.map((subject, index) => (
                <div
                  key={subject}
                  className={`bg-gradient-to-br ${
                    index % 3 === 0
                      ? "from-gray-600/10 to-gray-800/10 border-gray-500/30"
                      : index % 3 === 1
                      ? "from-gray-700/10 to-gray-900/10 border-gray-600/30"
                      : "from-gray-500/10 to-gray-700/10 border-gray-400/30"
                  } border-2 backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none shadow-xl animate-fadeIn ${
                    selectedSubject === subject
                      ? "ring-2 ring-gray-400 scale-105"
                      : ""
                  }`}
                  tabIndex={0}
                  onClick={() => handleSubjectSelection(subject)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSubjectSelection(subject);
                  }}
                >
                  <div className="text-center flex flex-col items-center">
                    <img
                      src={
                        subjectImages[subject.toLowerCase()] ||
                        "https://img.icons8.com/ios-filled/100/000000/question-mark.png"
                      }
                      alt={subject}
                      className="w-20 h-20 object-cover rounded-full mb-4 animate-fadeIn border-2 border-white/10 bg-black shadow-md"
                    />
                    <h3 className="text-white text-lg font-semibold mb-2 animate-fadeIn">
                      {subject}
                    </h3>
                    <p className="text-gray-300 text-sm animate-fadeIn">
                      {getQuestionCountBySubject(subject)} questions
                    </p>
                    {selectedSubject === subject && (
                      <div className="mt-3 animate-fadeIn">
                        <svg
                          className="w-6 h-6 text-white mx-auto"
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
          )}          {/* Start Quiz Button */}
          {subjects.length > 0 && (
            <div className="text-center animate-fadeIn">
              <button
                className={`py-4 px-8 rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectedSubject
                    ? "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:scale-105 focus:ring-gray-500 border border-gray-500/30"
                    : "bg-gray-600 cursor-not-allowed opacity-50 border border-gray-600/30"
                }`}
                onClick={handleStartQuiz}
                disabled={!selectedSubject}
              >
                {selectedSubject ? (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start {selectedSubject} Quiz
                  </div>
                ) : (
                  "Select a Subject First"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSelection;
