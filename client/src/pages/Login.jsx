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
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Login
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black dark:text-white"
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
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black dark:text-white"
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
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading.login}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200"
          >
            {loading.login ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="flex justify-between mt-4">
          <Link
            to="/forgot-password"
            className="text-xs text-black dark:text-white hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="text-xs text-black dark:text-white hover:underline"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
