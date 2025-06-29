import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchDailyActivityData } from "../redux/slices/dqSlice";

const GitHubStyleStreakCalendar = ({
  currentStreak,
  maxStreak,
  className = "",
}) => {
  const dispatch = useDispatch();
  const {
    dailyActivityData,
    dailyActivityLoading: loading,
    dailyActivityError: error,
  } = useSelector((state) => state.dq);

  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const scrollContainerRef = useRef(null);

  // Fetch activity data from Redux
  useEffect(() => {
    dispatch(fetchDailyActivityData(selectedYear));
  }, [selectedYear, dispatch]);

  // Extract activity data from Redux state
  const userActivityData = useMemo(() => {
    return dailyActivityData?.activityData || {};
  }, [dailyActivityData]);

  // Mock activity data for fallback
  const mockActivityData = useMemo(
    () => ({
      // June 2025 data
      "2025-06-28": { count: 2, subjects: ["Data Structures", "Algorithms"] },
      "2025-06-27": { count: 1, subjects: ["Database"] },
      "2025-06-26": {
        count: 3,
        subjects: ["OS", "Networks", "Software Engineering"],
      },
      "2025-06-25": { count: 1, subjects: ["Web Development"] },
      "2025-06-24": { count: 2, subjects: ["Python", "JavaScript"] },
      "2025-06-23": { count: 1, subjects: ["React"] },
      "2025-06-22": { count: 2, subjects: ["Node.js", "MongoDB"] },
      "2025-06-21": { count: 1, subjects: ["Computer Networks"] },
      "2025-06-20": { count: 3, subjects: ["DBMS", "SQL", "NoSQL"] },
      "2025-06-19": { count: 2, subjects: ["Software Engineering", "Testing"] },
      "2025-06-18": { count: 1, subjects: ["Algorithm Design"] },
      "2025-06-17": { count: 2, subjects: ["Data Structures", "Trees"] },
      "2025-06-16": { count: 1, subjects: ["Operating Systems"] },
      "2025-06-15": {
        count: 4,
        subjects: ["Web Dev", "React", "Node.js", "Express"],
      },
      // May 2025 data
      "2025-05-30": { count: 1, subjects: ["JavaScript"] },
      "2025-05-29": { count: 2, subjects: ["Python", "Django"] },
      "2025-05-28": { count: 1, subjects: ["Machine Learning"] },
      "2025-05-25": {
        count: 3,
        subjects: ["AI", "Deep Learning", "Neural Networks"],
      },
      // April 2025 data
      "2025-04-20": { count: 2, subjects: ["System Design", "Microservices"] },
      "2025-04-15": { count: 1, subjects: ["Cloud Computing"] },
      "2025-04-10": { count: 3, subjects: ["Docker", "Kubernetes", "DevOps"] },
    }),
    []
  );

  // Generate calendar data for a rolling year (GitHub style - all days in horizontal grid)
  // Shows from next month to current month (365/366 days) with today at the end
  const generateYearData = useCallback(
    (year) => {
      const months = [];
      const today = new Date();
      const currentMonth = today.getMonth();

      // Create rolling year: start from next month of previous year to current month
      const startMonth = currentMonth + 1;
      const startYear = year - 1;

      // Generate 12 months starting from next month of previous year
      for (let i = 0; i < 12; i++) {
        const monthIndex = (startMonth + i) % 12;
        const yearForMonth = startYear + Math.floor((startMonth + i) / 12);

        const monthData = {
          name: new Date(yearForMonth, monthIndex).toLocaleString("default", {
            month: "short",
          }),
          year: yearForMonth,
          monthIndex: monthIndex,
          weeks: [],
        };

        // Get first day of month and calculate start of first week
        const firstDayOfMonth = new Date(yearForMonth, monthIndex, 1);
        const startOfFirstWeek = new Date(firstDayOfMonth);
        startOfFirstWeek.setDate(
          firstDayOfMonth.getDate() - firstDayOfMonth.getDay()
        );

        // Get last day of month and calculate end of last week
        const lastDayOfMonth = new Date(yearForMonth, monthIndex + 1, 0);
        const endOfLastWeek = new Date(lastDayOfMonth);
        endOfLastWeek.setDate(
          lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay())
        );

        // Generate weeks for this month
        const currentDate = new Date(startOfFirstWeek);
        while (currentDate <= endOfLastWeek) {
          const weekData = [];

          for (let day = 0; day < 7; day++) {
            const dateString = currentDate.toISOString().split("T")[0];
            const isCurrentMonth = currentDate.getMonth() === monthIndex;
            const isCurrentYear = currentDate.getFullYear() === yearForMonth;
            const isToday = dateString === today.toISOString().split("T")[0];
            const isFuture = currentDate > today;

            const activity =
              userActivityData[dateString] || mockActivityData[dateString];

            weekData.push({
              date: dateString,
              day: currentDate.getDate(),
              month: currentDate.getMonth(),
              isCurrentMonth,
              isCurrentYear,
              isToday,
              isFuture,
              activity,
              level: isCurrentMonth
                ? getActivityLevel(activity?.count || 0)
                : -1,
            });

            currentDate.setDate(currentDate.getDate() + 1);
          }

          monthData.weeks.push(weekData);
        }

        months.push(monthData);
      }

      return months;
    },
    [userActivityData, mockActivityData]
  );

  // Get activity level (0-4) based on submission count
  const getActivityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count >= 3) return 3;
    return 4; // 5+ submissions
  };

  // Get color based on activity level (GitHub style)
  const getActivityColor = (
    level,
    isToday = false,
    isFuture = false,
    isCurrentMonth = true
  ) => {
    if (!isCurrentMonth) return "bg-gray-800"; // Other month - solid dark color
    if (isFuture) return "bg-gray-800"; // Future dates - solid dark color
    if (isToday) return "bg-green-400 ring-1 ring-cyan-400/50";

    const colors = {
      0: "bg-gray-800", // No activity - solid dark color
      1: "bg-green-300", // Light activity
      2: "bg-green-400", // Medium activity
      3: "bg-green-500", // High activity
      4: "bg-green-600", // Very high activity
    };

    return colors[level] || colors[0];
  };

  // Initialize year data
  useEffect(() => {
    setYearData(generateYearData(selectedYear));
  }, [selectedYear, userActivityData, generateYearData]);

  // Calculate year statistics
  const getYearStats = () => {
    let totalActiveDays = 0;
    let totalSubmissions = 0;
    let longestStreak = 0;
    let currentStreakCount = 0;

    yearData.forEach((month) => {
      month.weeks.forEach((week) => {
        week.forEach((day) => {
          if (day.isCurrentMonth && day.activity && day.activity.count > 0) {
            totalActiveDays++;
            totalSubmissions += day.activity.count;
            currentStreakCount++;
            longestStreak = Math.max(longestStreak, currentStreakCount);
          } else if (day.isCurrentMonth && !day.isFuture) {
            currentStreakCount = 0;
          }
        });
      });
    });

    return {
      totalActiveDays,
      totalSubmissions,
      longestStreak,
      weeklyAverage: Math.round((totalActiveDays / 52) * 10) / 10,
    };
  };

  const stats = getYearStats();

  // Auto-scroll to show today when component loads or year changes
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      selectedYear === new Date().getFullYear()
    ) {
      const container = scrollContainerRef.current;

      // Since today is at the end of our rolling year, scroll to the very end
      setTimeout(() => {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [yearData, selectedYear]);

  // Get tooltip content
  const getTooltipContent = (day) => {
    if (!day.isCurrentMonth || day.isFuture) return null;

    const count = day.activity?.count || 0;
    const subjects = day.activity?.subjects || [];

    if (count === 0) {
      return `No questions solved on ${new Date(
        day.date
      ).toLocaleDateString()}`;
    }

    return `${count} question${count > 1 ? "s" : ""} solved on ${new Date(
      day.date
    ).toLocaleDateString()}${
      subjects.length > 0 ? `\n${subjects.join(", ")}` : ""
    }`;
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700/50 rounded-2xl p-6 ${className}`}
    >
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
          />
          <span className="ml-3 text-gray-400">Loading activity data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
          <div className="text-red-400 text-sm">
            Failed to load activity data. Showing demo data.
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: currentStreak > 0 ? [1, 1.1, 1] : 1 }}
                  transition={{
                    duration: 2,
                    repeat: currentStreak > 0 ? Infinity : 0,
                  }}
                  className="text-3xl"
                >
                  🔥
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Daily Question Streak
                  </h3>
                  <p className="text-sm text-gray-400">
                    {stats.totalSubmissions} questions solved • Rolling year
                    ending {selectedYear}
                  </p>
                </div>
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-lg font-semibold text-white min-w-[80px] text-center">
                {selectedYear}
              </span>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                disabled={selectedYear >= new Date().getFullYear()}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
              <div className="text-lg font-bold text-cyan-400">
                {stats.totalActiveDays}
              </div>
              <div className="text-xs text-gray-400">Total Active Days</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
              <div className="text-lg font-bold text-purple-400">
                {maxStreak}
              </div>
              <div className="text-xs text-gray-400">Max Streak</div>
            </div>
          </div>

          {/* Calendar Grid - GitHub Style */}
          <div className="space-y-3">
            {/* Contribution Graph */}
            <div className="flex items-start">
              {/* Scrollable Calendar Container */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide flex-1"
              >
                {/* Month Labels */}
                <div className="flex justify-start items-center space-x-3 text-xs text-gray-400 px-1 mb-2 min-w-max">
                  {yearData.map((month) => (
                    <div
                      key={`${month.year}-${month.monthIndex}`}
                      className="text-center min-w-[60px]"
                    >
                      {month.name}
                    </div>
                  ))}
                </div>
                {/* Months with Small Gaps Between Squares */}
                <div className="flex space-x-3 min-w-max pr-4">
                  {yearData.map((month, monthIndex) => (
                    <div
                      key={`${month.year}-${month.monthIndex}-${monthIndex}`}
                      className="flex gap-0.5"
                    >
                      {month.weeks.map((week, weekIndex) => (
                        <div
                          key={`${monthIndex}-${weekIndex}`}
                          className="flex flex-col gap-0.5"
                        >
                          {week.map((day, dayIndex) => (
                            <motion.div
                              key={`${monthIndex}-${weekIndex}-${dayIndex}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay:
                                  monthIndex * 0.05 +
                                  weekIndex * 0.005 +
                                  dayIndex * 0.001,
                              }}
                              className="relative group"
                            >
                              <div
                                className={`
                                w-2.5 h-2.5 rounded-sm transition-all duration-200
                                ${
                                  day.isFuture
                                    ? "bg-gray-900/20 opacity-30 cursor-not-allowed"
                                    : `cursor-pointer hover:scale-125 ${getActivityColor(
                                        day.level,
                                        day.isToday,
                                        day.isFuture,
                                        day.isCurrentMonth
                                      )}`
                                }
                                ${day.isToday ? "ring-1 ring-cyan-400/50" : ""}
                              `}
                                title={
                                  day.isFuture
                                    ? "Future date"
                                    : getTooltipContent(day) || ""
                                }
                              >
                                {/* Today indicator */}
                                {day.isToday && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-0.5 h-0.5 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Less</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-2.5 h-2.5 rounded-sm ${getActivityColor(
                      level,
                      false,
                      false,
                      true
                    )}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">More</span>
            </div>

            <div className="text-xs text-gray-400">
              Learn how we count contributions
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GitHubStyleStreakCalendar;
