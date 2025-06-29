import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import StreakNotification from "./StreakNotification";

const AuthLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const [showStreakNotification, setShowStreakNotification] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  
  // Listen for streak updates
  useEffect(() => {
    if (user?.currentStreak && user.currentStreak > 0) {
      // Check if this is a new streak update (you might want to store this in localStorage)
      const lastShownStreak = localStorage.getItem('lastShownStreak');
      const currentStreak = user.currentStreak.toString();
      
      if (lastShownStreak !== currentStreak) {
        setStreakCount(user.currentStreak);
        setShowStreakNotification(true);
        localStorage.setItem('lastShownStreak', currentStreak);
      }
    }
  }, [user?.currentStreak]);

  const handleCloseStreakNotification = () => {
    setShowStreakNotification(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative z-10">
        <Navbar />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
      
      {/* Global Streak Notification */}
      <StreakNotification 
        show={showStreakNotification}
        streakCount={streakCount}
        onClose={handleCloseStreakNotification}
      />
    </div>
  );
};

export default AuthLayout;
