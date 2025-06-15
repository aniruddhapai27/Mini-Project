import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AuthLayout = () => {
  return (    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
