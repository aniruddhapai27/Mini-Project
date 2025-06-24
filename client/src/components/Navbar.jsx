import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { logoutUser } from "../redux/slices/authSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activitiesDropdownOpen, setActivitiesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActivitiesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <nav className="bg-black border-b border-cyan-500/20 sticky top-0 z-50 transition-colors duration-300 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo on the extreme left */}
          <div className="flex-shrink-0 flex items-center mr-auto">
            <Link
              to="/"
              className="text-2xl font-extrabold text-white tracking-wider"
              style={{ letterSpacing: "2px" }}
            >
              SkillWise-AI
            </Link>
          </div>{/* Navigation links */}
          <div className="flex items-center space-x-4 ml-auto">            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  isActive("/")
                    ? "text-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 shadow-lg"
                    : "text-white/70 hover:text-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 border-transparent hover:border-cyan-500/20"
                }`}
              >
                Home
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      isActive("/login")
                        ? "text-white bg-white/10 border-white/30 shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      isActive("/register")
                        ? "text-white bg-white/10 border-white/30 shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      isActive("/dashboard")
                        ? "text-white bg-white/10 border-white/30 shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                    }`}
                  >
                    Dashboard
                  </Link>                  {/* Activities Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 border ${
                        isActive("/quiz-selection") || isActive("/mock-interview-selection") || isActive("/mock-interview")
                          ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-lg"
                          : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5 border-transparent hover:border-cyan-500/20"
                      }`}
                      onClick={() => setActivitiesDropdownOpen(!activitiesDropdownOpen)}
                    >
                      <span>Activities</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${activitiesDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>{/* Dropdown Menu */}
                    {activitiesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl z-50 animate-fadeIn">
                        <div className="py-2">                          <Link
                            to="/quiz-selection"
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                              isActive("/quiz-selection")
                                ? "text-cyan-400 bg-cyan-500/10"
                                : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5"
                            }`}
                            onClick={() => setActivitiesDropdownOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Quiz</div>
                                <div className="text-xs text-gray-400">Test your knowledge</div>
                              </div>
                            </div>
                          </Link>                          <Link
                            to="/mock-interview-selection"
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                              isActive("/mock-interview-selection") || isActive("/mock-interview")
                                ? "text-orange-400 bg-orange-500/10"
                                : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/5"
                            }`}
                            onClick={() => setActivitiesDropdownOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Mock Interview</div>
                                <div className="text-xs text-gray-400">Practice interviews</div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/study-assistant/new"
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                              isActive("/study-assistant") || location.pathname.includes("/study-assistant")
                                ? "text-green-400 bg-green-500/10"
                                : "text-gray-300 hover:text-green-400 hover:bg-green-500/5"
                            }`}
                            onClick={() => setActivitiesDropdownOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Study Assistant</div>
                                <div className="text-xs text-gray-400">AI-powered learning</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      isActive("/profile")
                        ? "text-white bg-white/10 border-white/30 shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
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
            </div>            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-white"
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
      </div>      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800/80 backdrop-blur-md border-t border-cyan-500/20 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">            <Link
              to="/"
              className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                isActive("/")
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                  : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5 border-transparent hover:border-cyan-500/20"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <>                <Link
                  to="/login"
                  className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                    isActive("/login")
                      ? "text-white bg-white/10 border-white/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                    isActive("/register")
                      ? "text-white bg-white/10 border-white/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {" "}                <Link
                  to="/dashboard"
                  className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                    isActive("/dashboard")
                      ? "text-white bg-white/10 border-white/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>                {/* Activities Section for Mobile */}
                <div className="px-3 py-2">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Activities
                  </div>
                  <div className="ml-2 space-y-1">
                    <Link
                      to="/quiz-selection"
                      className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                        isActive("/quiz-selection")
                          ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                          : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5 border-transparent hover:border-cyan-500/20"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span>Quiz</span>
                      </div>
                    </Link>
                    
                    <Link
                      to="/mock-interview-selection"
                      className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                        isActive("/mock-interview-selection") || isActive("/mock-interview")
                          ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
                          : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/5 border-transparent hover:border-orange-500/20"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span>Mock Interview</span>
                      </div>
                    </Link>

                    <Link
                      to="/study-assistant/new"
                      className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                        isActive("/study-assistant") || location.pathname.includes("/study-assistant")
                          ? "text-green-400 bg-green-500/10 border-green-500/30"
                          : "text-gray-300 hover:text-green-400 hover:bg-green-500/5 border-transparent hover:border-green-500/20"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span>Study Assistant</span>
                      </div>
                    </Link>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 rounded-lg text-base font-medium border transition-all duration-300 ${
                    isActive("/profile")
                      ? "text-white bg-white/10 border-white/30" 
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="w-full text-left block px-4 py-2 rounded-lg text-base font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-300"
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
