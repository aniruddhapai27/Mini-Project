import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginUser } from "../redux/slices/authSlice";
import DotLottieLoader from "../components/DotLottieLoader";

const Login = () => {
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show loading toast
    const loadingToast = toast.loading("Signing in...");

    try {
      // dispatch login action
      const resultAction = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      );

      // Check if the login was successful
      if (loginUser.fulfilled.match(resultAction)) {
        // Dismiss loading toast and show success toast
        toast.dismiss(loadingToast);
        toast.success("Login successful! Redirecting...");

        // Navigate to dashboard after successful login
        navigate("/dashboard");
      } else {
        // If rejected, get the error message
        const errorMessage =
          resultAction.payload || "Login failed. Please try again.";

        // Dismiss loading toast and show error toast
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
      }
    } catch (err) {
      // Dismiss loading toast and show error toast for unexpected errors
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login failed:", err);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon fill="none" stroke="white" strokeWidth="1" points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="20" y="20" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="30" cy="10" r="2" fill="white" opacity="0.3"/>
                <circle cx="50" cy="30" r="2" fill="white" opacity="0.3"/>
                <circle cx="30" cy="50" r="2" fill="white" opacity="0.3"/>
                <circle cx="10" cy="30" r="2" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-white opacity-10 rotate-45 animate-float-slow"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-gray-300 opacity-15 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-white opacity-20 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-10 right-10 w-5 h-5 bg-gray-400 opacity-12 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white opacity-25 rotate-45 animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-gray-500 opacity-10 rounded-full animate-float-fast"></div>

        {/* Diamond Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diamonds" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gray-300/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-0 top-1/4 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-0 bottom-1/3 w-full h-px bg-gradient-to-r from-transparent via-gray-400/15 to-transparent animate-pulse" style={{ animationDelay: "3s" }}></div>

        {/* Particle System */}
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-white opacity-40 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-gray-300 opacity-50 rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white opacity-60 rounded-full animate-ping" style={{ animationDelay: "2s" }}></div>
      </div>      {/* Login Form Container */}
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/80 backdrop-blur-xl border border-gray-700/20 rounded-2xl shadow-2xl relative overflow-hidden z-10">
        {/* Form Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-gray-500/5 rounded-2xl"></div>
        
        {/* Animated form background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-4 right-4 w-16 h-16 bg-gray-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-300 text-sm">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email address
            </label>            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 mt-2 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 mt-2 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading.login}
            className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-300 disabled:opacity-50 shadow-lg border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {loading.login ? (
              <DotLottieLoader 
                size="w-5 h-5" 
                text="Signing in..." 
                layout="horizontal"
                textSize="text-sm"
                textColor="text-white"
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>        <div className="flex justify-between mt-6">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
