import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchDailyActivityData, 
  selectDailyActivityData, 
  selectQuizResults 
} from "../redux/slices/dqSlice";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const GitHubStyleStreakCalendar = () => {
  const dispatch = useDispatch();
  const dailyActivityData = useSelector(selectDailyActivityData);
  const quizResults = useSelector(selectQuizResults);
  const [streaksData, setStreaksData] = useState([]); // Holds data for each month block
  const [activityStatus, setActivityStatus] = useState({});
  const [lastQuizResultTimestamp, setLastQuizResultTimestamp] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Fetch daily activity data for the current year
    const currentYear = new Date().getFullYear();
    dispatch(fetchDailyActivityData(currentYear));
  }, [dispatch]);

  // Refresh activity data when a new quiz is completed
  useEffect(() => {
    if (quizResults && quizResults.timestamp) {
      if (lastQuizResultTimestamp !== quizResults.timestamp) {
        setLastQuizResultTimestamp(quizResults.timestamp);
        // Immediately update today's activity optimistically
        const today = formatDate(new Date());
        setActivityStatus((prev) => {
          const currentLevel = prev[today] || "";
          let newLevel = "low"; // Default to 1 quiz

          // Increment the intensity level
          if (currentLevel === "low") newLevel = "medium";
          else if (currentLevel === "medium") newLevel = "high";
          else if (currentLevel === "high") newLevel = "very-high";
          else if (currentLevel === "very-high") newLevel = "very-high";
          else newLevel = "low"; // First quiz of the day

          return { ...prev, [today]: newLevel };
        });

        // Refresh the activity data from backend after a short delay to ensure backend has processed
        setTimeout(() => {
          const currentYear = new Date().getFullYear();
          dispatch(fetchDailyActivityData(currentYear));
        }, 1000);
      }
    }
  }, [quizResults, lastQuizResultTimestamp, dispatch]);

  useEffect(() => {
    // Define today's date here to be accessible within the effect
    // This ensures it captures the date at the time the effect runs.
    const todayRefDate = new Date();

    const numberOfMonthsToDisplay = 9; // Display current and past 9 months (10 total)
    const newMonthlyData = [];

    for (let i = 0; i < numberOfMonthsToDisplay; i++) {
      const targetIterationDate = new Date(
        todayRefDate.getFullYear(),
        todayRefDate.getMonth() - i,
        1
      );
      const monthName = targetIterationDate.toLocaleString("default", {
        month: "short",
      });
      const year = targetIterationDate.getFullYear();

      const firstDayOfMonth = new Date(
        targetIterationDate.getFullYear(),
        targetIterationDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        targetIterationDate.getFullYear(),
        targetIterationDate.getMonth() + 1,
        0
      );

      const daysInMonthGrid = [];
      const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

      // Add initial padding cells for the first week
      for (let j = 0; j < startingDayOfWeek; j++) {
        daysInMonthGrid.push({
          type: "padding",
          key: `padding-${monthName}-${year}-${j}`,
        });
      }

      // Add day cells
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDateObject = new Date(
          targetIterationDate.getFullYear(),
          targetIterationDate.getMonth(),
          day
        );
        daysInMonthGrid.push({
          type: "day",
          date: currentDateObject,
          dateString: formatDate(currentDateObject),
          key: formatDate(currentDateObject),
        });
      }

      newMonthlyData.push({
        monthName,
        year,
        days: daysInMonthGrid,
        key: `${year}-${monthName}`,
      });
    }    setStreaksData(newMonthlyData.reverse()); // Show past months first, up to current

    // Set activity status from dailyActivityData
    const tempActivityStatus = {};
    if (dailyActivityData && dailyActivityData.activityData) {
      Object.keys(dailyActivityData.activityData).forEach((dateString) => {
        const dayData = dailyActivityData.activityData[dateString];
        const quizCount = dayData.count || 0;
        
        // Set activity level based on quiz count
        if (quizCount >= 5) {
          tempActivityStatus[dateString] = "very-high"; // Dark green
        } else if (quizCount >= 3) {
          tempActivityStatus[dateString] = "high"; // Medium-dark green
        } else if (quizCount >= 2) {
          tempActivityStatus[dateString] = "medium"; // Medium green
        } else if (quizCount >= 1) {
          tempActivityStatus[dateString] = "low"; // Light green
        }
      });
    }

    setActivityStatus(tempActivityStatus);
  }, [dailyActivityData]); // Depend on dailyActivityData to re-run when it changes

  
  // Auto-scroll to current month when streaksData changes
  useEffect(() => {
    if (streaksData.length > 0 && scrollContainerRef.current) {
      const today = new Date();
      const currentMonth = today.toLocaleString("default", { month: "short" });
      const currentYear = today.getFullYear();
      
      // Find the current month index (remembering months are in reverse order - oldest first)
      const currentMonthIndex = streaksData.findIndex(month => 
        month.monthName === currentMonth && month.year === currentYear
      );
      
      if (currentMonthIndex !== -1) {
        // Use a timeout to ensure the DOM has rendered
        setTimeout(() => {
          const container = scrollContainerRef.current;
          const monthElements = container.children;
          
          if (monthElements[currentMonthIndex]) {
            // Get the actual position of the current month
            const currentMonthElement = monthElements[currentMonthIndex];
            const scrollPosition = currentMonthElement.offsetLeft;
            
            // Scroll to show current month with some padding
            container.scrollTo({
              left: Math.max(0, scrollPosition - container.clientWidth / 4), // Show with 25% padding from left
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [streaksData]);

  const getActivityTooltip = (dateString) => {
    if (
      dailyActivityData &&
      dailyActivityData.activityData &&
      dailyActivityData.activityData[dateString]
    ) {
      const dayData = dailyActivityData.activityData[dateString];
      const quizCount = dayData.count || 0;
      const subjects = dayData.subjects || [];

      if (quizCount === 0) return "No activity";

      const subjectText =
        subjects.length > 0
          ? ` (${subjects.slice(0, 3).join(", ")}${
              subjects.length > 3 ? "..." : ""
            })`
          : "";

      return `${quizCount} quiz${
        quizCount > 1 ? "es" : ""
      } completed${subjectText}`;
    }
    return "No activity";
  };

  const getDayCellStyle = (dateString) => {
    const status = activityStatus[dateString];
    const cellDate = new Date(dateString);

    const todayForComparison = new Date();
    todayForComparison.setHours(0, 0, 0, 0); // Normalize to midnight
    
    const isToday = cellDate.getTime() === todayForComparison.getTime();

    // Base styles
    let baseStyle = "";
    
    // Different intensity levels based on quiz activity
    if (status === "very-high") {
      baseStyle = "bg-green-800 hover:bg-green-700 border border-green-900 shadow-sm"; // Very dark green (5+ quizzes)
    } else if (status === "high") {
      baseStyle = "bg-green-600 hover:bg-green-500 border border-green-700 shadow-sm"; // Dark green (3-4 quizzes)
    } else if (status === "medium") {
      baseStyle = "bg-green-500 hover:bg-green-400 border border-green-600 shadow-sm"; // Medium green (2 quizzes)
    } else if (status === "low") {
      baseStyle = "bg-green-400 hover:bg-green-300 border border-green-500 shadow-sm"; // Light green (1 quiz)
    } else if (cellDate > todayForComparison) {
      baseStyle = "bg-slate-700/30 cursor-not-allowed"; // Style for future days
    } else {
      baseStyle = "bg-slate-600/50 hover:bg-slate-500/60"; // Default for past non-active days
    }

    // Add today's highlight
    if (isToday) {
      baseStyle += " ring-2 ring-[#B200FF] ring-opacity-80"; // Purple ring for today
    }

    return baseStyle;
  };

  const weekDayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-gradient-to-br from-black/80 to-black/60 border border-[#B200FF]/30 p-4 rounded-lg shadow-xl shadow-black/40 backdrop-blur-md text-white w-full mx-auto flex flex-col items-center">
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <h2 className="text-xl font-bold text-[#B200FF] mb-4 tracking-normal text-center">
        Activity Overview
      </h2>
      <div ref={scrollContainerRef} className="hide-scrollbar flex flex-row overflow-x-auto py-2 space-x-3 w-full">
        {streaksData.map((monthData) => (
          <div key={monthData.key} className="flex-shrink-0">
            <h3 className="text-base font-semibold text-center text-purple-300 mb-2">
              {monthData.monthName} {monthData.year}
            </h3>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {weekDayLabels.map((label) => (
                <div
                  key={`${monthData.key}-${label}`}
                  className="w-4 h-4 flex items-center justify-center text-xs text-gray-200 font-medium"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthData.days.map((dayItem) => {
                if (dayItem.type === "padding") {
                  return (
                    <div key={dayItem.key} className="w-4 h-4 rounded-sm"></div>
                  );
                }

                const cellStyle = getDayCellStyle(dayItem.dateString);

                return (
                  <div
                    key={dayItem.key}
                    className={`w-4 h-4 rounded-sm transition-all duration-150 ${cellStyle}`}
                    title={`${dayItem.dateString} - ${getActivityTooltip(
                      dayItem.dateString
                    )}`}
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubStyleStreakCalendar;
