import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
