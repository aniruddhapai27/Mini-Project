import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20"></div>

      {/* Animated particles/dots */}
      <div className="absolute inset-0">
        {/* Large glow effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>

      {/* Floating neon elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-ping"></div>
      <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-ping delay-300"></div>
      <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_6px_rgba(244,114,182,0.8)] animate-ping delay-700"></div>
      <div className="absolute bottom-10 right-10 w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_4px_rgba(103,232,249,0.8)] animate-ping delay-1000"></div>
    </div>
  );
};

export default AuthLayout;
