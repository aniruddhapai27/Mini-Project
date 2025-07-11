import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { dqAPI } from "../utils/dqApi";
import { toast } from "react-hot-toast";
import DotLottieLoader from "./DotLottieLoader";

const QuizPerformanceGraph = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [timeframe, setTimeframe] = useState("30d");
  const [viewType, setViewType] = useState("overall"); // "overall" or "monthly"
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const subjects = [
    "Data Structures",
    "operating systems",
    "computer networks",
    "database management systems",
    "software engineering",
    "algorithm design and analysis",
  ];

  // Colors for different subjects
  const subjectColors = {
    "Data Structures": "#8884d8",
    "operating systems": "#82ca9d",
    "computer networks": "#ffc658",
    "database management systems": "#ff7c7c",
    "software engineering": "#8dd1e1",
    "algorithm design and analysis": "#d084d0",
    all: "#6366f1",
  };

  // Get available subjects from stats data
  const getAvailableSubjects = () => {
    if (!stats || !stats.subjectStats) return subjects;

    // Always return the full subject list so users can see all options
    // But the ones with data will show graphs, others will show "no data" message
    return subjects;
  };

  // Get current month info for display
  const getCurrentMonthInfo = () => {
    const now = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return {
      name: monthNames[now.getMonth()],
      year: now.getFullYear(),
      daysRemaining:
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
        now.getDate(),
    };
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Add viewType parameter to API call
      const response = await dqAPI.getQuizStats(
        timeframe,
        selectedSubject === "all" ? null : selectedSubject,
        viewType // Pass viewType to backend
      );

      setStats(response.data);
    } catch (error) {
      console.error("Quiz stats error:", error);
      toast.error("Failed to fetch quiz statistics");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, timeframe, viewType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showInfoTooltip &&
        event.target.classList.contains("modal-backdrop")
      ) {
        setShowInfoTooltip(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showInfoTooltip) {
        setShowInfoTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showInfoTooltip]);

  const formatChartData = () => {
    if (!stats || !stats.dailyScores) {
      return [];
    }

    return stats.dailyScores.map((day) => {
      const date = new Date(day.date);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      if (selectedSubject === "all") {
        return {
          date: formattedDate,
          bestScore: day.overallBestScore,
          totalQuizzes: day.totalQuizzes,
          fullDate: day.date,
        };
      } else {
        const subjectData = day.subjects.find(
          (s) => s.subject === selectedSubject
        );

        return {
          date: formattedDate,
          bestScore: subjectData ? subjectData.bestScore : 0,
          avgScore: subjectData ? Math.round(subjectData.avgScore) : 0,
          quizCount: subjectData ? subjectData.quizCount : 0,
          fullDate: day.date,
        };
      }
    });
  };

  const formatSubjectData = () => {
    if (!stats || !stats.subjectStats) return [];

    return stats.subjectStats.map((subject) => {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter quizzes for current month only if monthly view is selected
      let monthlyBestScore = parseFloat((subject.bestScore || 0).toFixed(2));
      let monthlyAvgScore = parseFloat((subject.avgScore || 0).toFixed(2));
      let monthlyTotalQuizzes = subject.totalQuizzes;
      let monthlyAccuracy = parseFloat(
        (
          subject.accuracy ||
          (subject.totalCorrect / subject.totalQuestions) * 100 ||
          0
        ).toFixed(2)
      );

      if (viewType === "monthly" && subject.monthlyStats) {
        const currentMonthStats = subject.monthlyStats.find(
          (month) => month.month === currentMonth && month.year === currentYear
        );

        if (currentMonthStats) {
          monthlyBestScore = parseFloat(
            (currentMonthStats.bestScore || 0).toFixed(2)
          );
          monthlyAvgScore = parseFloat(
            (currentMonthStats.avgScore || 0).toFixed(2)
          );
          monthlyTotalQuizzes = currentMonthStats.totalQuizzes || 0;
          monthlyAccuracy = parseFloat(
            (
              (currentMonthStats.totalCorrect /
                currentMonthStats.totalQuestions) *
                100 || 0
            ).toFixed(2)
          );
        } else {
          // No data for current month
          monthlyBestScore = 0.0;
          monthlyAvgScore = 0.0;
          monthlyTotalQuizzes = 0;
          monthlyAccuracy = 0.0;
        }
      }

      // Create short forms for subjects
      const getShortSubject = (subjectName) => {
        const shortForms = {
          "Data Structures": "DS",
          "operating systems": "OS",
          "computer networks": "CN",
          "database management systems": "DBMS",
          "software engineering": "SE",
          "algorithm design and analysis": "ADA",
        };
        return shortForms[subjectName] || subjectName;
      };

      return {
        subject: subject._id,
        shortSubject:
          subject._id === "Data Structures"
            ? "Data Structures"
            : subject._id
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
        displaySubject: getShortSubject(subject._id), // Short form for small screens
        avgScore: monthlyAvgScore,
        bestScore: monthlyBestScore,
        totalQuizzes: monthlyTotalQuizzes,
        accuracy: monthlyAccuracy,
        isCurrentMonth: viewType === "monthly",
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${
                entry.dataKey === "bestScore"
                  ? "Best Score"
                  : entry.dataKey === "avgScore"
                  ? "Avg Score"
                  : entry.dataKey === "quizCount"
                  ? "Quiz Count"
                  : entry.dataKey
              }: ${entry.value}${entry.dataKey.includes("Score") ? "%" : ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center h-64">
          <DotLottieLoader
            size="w-8 h-8"
            text="Loading quiz statistics..."
            layout="horizontal"
            textColor="text-gray-400"
          />
        </div>
      </div>
    );
  }

  const chartData = formatChartData();
  const subjectData = formatSubjectData();

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Quiz Performance Analytics
          </h2>
          {viewType === "monthly" && (
            <p className="text-sm text-purple-400 mt-1">
              📅 {getCurrentMonthInfo().name} {getCurrentMonthInfo().year}{" "}
              Performance
              <span className="text-gray-500 ml-2">
                (Resets in {getCurrentMonthInfo().daysRemaining} days)
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* View Type Toggle */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="overall">All-Time Performance</option>
            <option value="monthly">Current Month Performance</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Subjects</option>
            {getAvailableSubjects().map((subject) => (
              <option key={subject} value={subject}>
                {subject === "Data Structures"
                  ? subject
                  : subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Daily Performance Chart */}
      {chartData.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Best Scores -{" "}
            {selectedSubject === "all"
              ? "All Subjects"
              : selectedSubject === "Data Structures"
              ? selectedSubject
              : selectedSubject.charAt(0).toUpperCase() +
                selectedSubject.slice(1)}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bestScore"
                  stroke={subjectColors[selectedSubject]}
                  strokeWidth={3}
                  dot={{
                    fill: subjectColors[selectedSubject],
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{ r: 6 }}
                  name="Best Score (%)"
                />
                {selectedSubject !== "all" && (
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#82ca9d", strokeWidth: 2, r: 3 }}
                    name="Avg Score (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          {selectedSubject === "all" ? (
            <>
              <p className="text-gray-400">
                No quiz data available for the selected timeframe.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Take some quizzes to see your performance analytics!
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-400">
                No quiz data available for "
                {selectedSubject === "Data Structures"
                  ? selectedSubject
                  : selectedSubject.charAt(0).toUpperCase() +
                    selectedSubject.slice(1)}
                ".
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Take a{" "}
                {selectedSubject === "Data Structures"
                  ? selectedSubject
                  : selectedSubject}{" "}
                quiz to see your performance for this subject!
              </p>
            </>
          )}
        </div>
      )}

      {/* Subject-wise Performance (when All Subjects is selected) */}
      {selectedSubject === "all" && subjectData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-white">
              Subject-wise Performance Overview
              {viewType === "monthly" && (
                <span className="ml-2 text-sm font-normal text-purple-400">
                  (Current Month - Resets on 1st of each month)
                </span>
              )}
            </h3>

            {/* Info Button */}
            <div className="relative">
              <button
                className="w-5 h-5 rounded-full border border-gray-500 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-400 transition-all duration-200 flex items-center justify-center text-xs font-medium"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                aria-label="Performance tracking information"
              >
                i
              </button>
            </div>
          </div>

          {/* Centered Info Modal */}
          {showInfoTooltip && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-lg">🔄</span>
                    <h4 className="text-white font-semibold text-lg">
                      Monthly Performance Tracking
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowInfoTooltip(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>

                <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                  <div>
                    <span className="text-cyan-400 font-medium flex items-center gap-2">
                      📊 Performance Metrics
                    </span>
                    <p className="mt-1 text-gray-400">
                      Best Score, Average Score, Quiz Count & Accuracy are
                      tracked separately for each month.
                    </p>
                  </div>

                  <div>
                    <span className="text-green-400 font-medium flex items-center gap-2">
                      🗓️ Monthly Reset
                    </span>
                    <p className="mt-1 text-gray-400">
                      All monthly statistics automatically reset to 0 on the 1st
                      of each month, giving you a fresh start.
                    </p>
                  </div>

                  <div>
                    <span className="text-purple-400 font-medium flex items-center gap-2">
                      🎯 Benefits
                    </span>
                    <ul className="mt-1 text-gray-400 list-disc list-inside space-y-1">
                      <li>Track monthly learning goals</li>
                      <li>See consistent improvement trends</li>
                      <li>Compare monthly vs all-time performance</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">
                        <span className="text-yellow-400">💡 Tip:</span> Switch
                        between "All-Time" and "Current Month" views using the
                        dropdown above.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="bg-blue-900/20 rounded-lg p-3">
                      <span className="text-blue-400 font-medium text-xs">
                        📱 Subject Abbreviations:
                      </span>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
                        <div>• DS = Data Structures</div>
                        <div>• OS = Operating Systems</div>
                        <div>• CN = Computer Networks</div>
                        <div>• DBMS = Database Management</div>
                        <div>• SE = Software Engineering</div>
                        <div>• ADA = Algorithm Design</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="displaySubject"
                  stroke="#9CA3AF"
                  fontSize={11}
                  width={60}
                  tick={{ fill: "#9CA3AF" }}
                  tickFormatter={(value) => {
                    // Use short forms, no need to truncate
                    return value;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg">
                          <p className="text-white font-medium mb-2">
                            {data.subject}
                          </p>
                          {data.isCurrentMonth && (
                            <p className="text-purple-400 text-xs mb-2 italic">
                              📅 Current Month Performance
                            </p>
                          )}
                          <div className="space-y-1">
                            <p className="text-cyan-400 text-sm">
                              Average Score:{" "}
                              <span className="font-semibold">
                                {data.avgScore.toFixed(2)}%
                              </span>
                            </p>
                            <p className="text-green-400 text-sm">
                              Best Score:{" "}
                              <span className="font-semibold">
                                {data.bestScore.toFixed(2)}%
                              </span>
                            </p>
                            <p className="text-blue-400 text-sm">
                              Total Quizzes:{" "}
                              <span className="font-semibold">
                                {data.totalQuizzes}
                              </span>
                            </p>
                            <p className="text-purple-400 text-sm">
                              Accuracy:{" "}
                              <span className="font-semibold">
                                {data.accuracy.toFixed(2)}%
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                <Bar
                  dataKey="avgScore"
                  fill="#6366f1"
                  name="Average Score (%)"
                  radius={[0, 4, 4, 0]}
                  strokeWidth={1}
                  stroke="#4f46e5"
                />
                <Bar
                  dataKey="bestScore"
                  fill="#10b981"
                  name="Best Score (%)"
                  radius={[0, 4, 4, 0]}
                  strokeWidth={1}
                  stroke="#059669"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {subjectData.length > 0 ? (
              subjectData.map((subject) => (
                <div
                  key={subject.subject}
                  className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors ${
                    subject.isCurrentMonth ? "ring-1 ring-purple-500/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className="text-white font-medium text-sm truncate"
                      title={subject.subject}
                    >
                      <span className="hidden sm:inline">
                        {subject.shortSubject}
                      </span>
                      <span className="sm:hidden">
                        {subject.displaySubject}
                      </span>
                    </h4>
                    {subject.isCurrentMonth && (
                      <div className="text-purple-400 text-xs bg-purple-500/10 px-2 py-1 rounded">
                        <span className="hidden sm:inline">📅 Monthly</span>
                        <span className="sm:hidden">📅</span>
                      </div>
                    )}
                  </div>

                  {subject.totalQuizzes > 0 ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            Best Score
                          </span>
                          <span className="text-green-400 font-semibold text-sm">
                            {subject.bestScore.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            Avg Score
                          </span>
                          <span className="text-cyan-400 font-semibold text-sm">
                            {subject.avgScore.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Quizzes</span>
                          <span className="text-blue-400 font-semibold text-sm">
                            {subject.totalQuizzes}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            Accuracy
                          </span>
                          <span className="text-purple-400 font-semibold text-sm">
                            {subject.accuracy.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar for best score */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{subject.bestScore.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              subject.isCurrentMonth
                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                : "bg-gradient-to-r from-cyan-500 to-green-500"
                            }`}
                            style={{ width: `${subject.bestScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-500 text-xs">
                        {subject.isCurrentMonth
                          ? "No quizzes taken this month"
                          : "No quiz data available"}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        {subject.isCurrentMonth
                          ? "Start taking quizzes to track monthly progress!"
                          : "Take a quiz to see performance data"}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 mb-2">📊</div>
                <p className="text-gray-400">
                  {viewType === "monthly"
                    ? "No quiz data for this month yet."
                    : "No quiz data available."}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {viewType === "monthly"
                    ? "Take some quizzes to start tracking your monthly progress!"
                    : "Take some quizzes to see your performance analytics!"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPerformanceGraph;
