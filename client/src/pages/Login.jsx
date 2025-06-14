import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginUser } from "../redux/slices/authSlice";

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
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 dark:bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-4 right-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse"
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
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 mt-2 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 mt-2 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading.login}
            className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 shadow-lg border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            {loading.login ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>        <div className="flex justify-between mt-6">
          <Link
            to="/forgot-password"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
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
