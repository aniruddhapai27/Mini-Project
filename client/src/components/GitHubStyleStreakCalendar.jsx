import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const GitHubStyleStreakCalendar = () => {
  const { user } = useSelector((state) => state.auth);
  const [streaksData, setStreaksData] = useState([]); // Holds data for each month block
  const [activityStatus, setActivityStatus] = useState({});

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
    }

    setStreaksData(newMonthlyData.reverse()); // Show past months first, up to current

    // Set activity status from user.loginActivity
    const tempActivityStatus = {};
    if (user && user.loginActivity && Array.isArray(user.loginActivity)) {
      user.loginActivity.forEach((activityDateStr) => {
        const activityDate = new Date(activityDateStr);
        const formattedDate = formatDate(activityDate);
        // Only mark as active if the date is not in the future relative to todayRefDate
        if (activityDate <= todayRefDate) {
          tempActivityStatus[formattedDate] = "active"; // Mark as active
        }
      });
    }

    setActivityStatus(tempActivityStatus);
  }, [user]); // Depend on user to re-run if loginActivity changes

  const getDayCellStyle = (dateString) => {
    const status = activityStatus[dateString];
    const cellDate = new Date(dateString);

    const todayForComparison = new Date();
    todayForComparison.setHours(0, 0, 0, 0); // Normalize to midnight

    if (status === "active") {
      return "bg-green-500 hover:bg-green-400 border border-green-700 shadow-sm"; // Green for active days
    }

    if (cellDate > todayForComparison) {
      return "bg-slate-700/30 cursor-not-allowed"; // Style for future days
    }
    return "bg-slate-600/50 hover:bg-slate-500/60"; // Default for past non-active days
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
      <div className="hide-scrollbar flex flex-row overflow-x-auto py-2 space-x-3 w-full">
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
                    title={`${dayItem.dateString} - ${
                      activityStatus[dayItem.dateString] || "No activity"
                    }`}
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
