import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { logoutUser } from "../redux/slices/authSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        toast.dismiss(loadingToast);
        toast.success("Logged out successfully!");
        navigate("/");
        setMobileMenuOpen(false); // Close mobile menu after logout
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to logout. Please try again.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred during logout.");
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-cyan-500/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400 transition-all duration-300"
          >
            InterviewAI
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
              }`}
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive("/login")
                      ? "text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive("/register")
                      ? "text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive("/dashboard")
                      ? "text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium border border-red-500 text-red-400 hover:bg-red-500 hover:text-gray-900 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                  onClick={handleLogout}
                  disabled={loading.logout}
                >
                  {loading.logout ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Logging out...</span>
                    </div>
                  ) : (
                    "Logout"
                  )}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-gray-300 hover:text-cyan-400 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800/80 backdrop-blur-md border-t border-cyan-500/20 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/login")
                      ? "text-cyan-400 bg-cyan-500/10"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/register")
                      ? "text-cyan-400 bg-cyan-500/10"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "text-cyan-400 bg-cyan-500/10"
                      : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={handleLogout}
                  disabled={loading.logout}
                >
                  {loading.logout ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Logging out...</span>
                    </div>
                  ) : (
                    "Logout"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Neon glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
    </nav>
  );
};

export default Navbar;
