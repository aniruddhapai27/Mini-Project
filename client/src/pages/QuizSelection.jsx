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
    navigate(`/quiz/${selectedSubject}`);
  };

  const getSubjectsFromQuestions = () => {
    if (!dailyQuestions || !Array.isArray(dailyQuestions)) return [];

    const subjects = [...new Set(dailyQuestions.map((q) => q.subject))];
    return subjects;
  };

  const getQuestionCountBySubject = (subject) => {
    if (!dailyQuestions || !Array.isArray(dailyQuestions)) return 0;
    return dailyQuestions.filter((q) => q.subject === subject).length;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl">
          <div className="w-12 h-12 border-4 border-t-cyan-500 border-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading quiz subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 max-w-md shadow-xl">
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
            className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 border border-cyan-500/30 shadow-lg"
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

  return (    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4 animate-fadeIn">
            Daily Quiz Challenge
          </h1>
          <p className="text-black/70 dark:text-white/70 text-lg animate-fadeIn">
            Choose your subject and test your knowledge
          </p>
        </div>
        {/* Subject Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-6 text-center animate-fadeIn">
            Select a Subject
          </h2>
          {subjects.length === 0 ? (
            <div className="text-center bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-8 animate-fadeIn shadow-xl">
              <svg
                className="w-12 h-12 text-cyan-400 mx-auto mb-4"
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {subjects.map((subject, index) => (
                <div
                  key={subject}
                  className={`bg-gradient-to-br ${
                    index % 3 === 0
                      ? "from-cyan-500/10 to-blue-500/10 border-cyan-500/30"
                      : index % 3 === 1
                      ? "from-purple-500/10 to-pink-500/10 border-purple-500/30"
                      : "from-green-500/10 to-emerald-500/10 border-green-500/30"
                  } border-2 backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none shadow-xl animate-fadeIn ${
                    selectedSubject === subject
                      ? "ring-2 ring-cyan-400 scale-105"
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
                      className="w-20 h-20 object-cover rounded-full mb-4 animate-fadeIn border-2 border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-md"
                    />
                    <h3 className="text-black dark:text-white text-lg font-semibold mb-2 animate-fadeIn">
                      {subject}
                    </h3>
                    <p className="text-black/70 dark:text-white/70 text-sm animate-fadeIn">
                      {getQuestionCountBySubject(subject)} questions
                    </p>
                    {selectedSubject === subject && (
                      <div className="mt-3 animate-fadeIn">
                        <svg
                          className="w-6 h-6 text-black dark:text-white mx-auto"
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 focus:ring-purple-500 border border-purple-500/30"
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
