import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  forgotPassword,
  clearErrors,
  clearSuccess,
} from "../redux/slices/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.auth);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    await dispatch(forgotPassword(email));
  };
  // Handle success/error responses
  useEffect(() => {
    if (success.forgotPassword) {
      toast.success("Password reset instructions sent to your email");
      dispatch(clearSuccess());
    }

    if (error.forgotPassword) {
      toast.error(error.forgotPassword);
      dispatch(clearErrors());
    }
  }, [success.forgotPassword, error.forgotPassword, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 rounded-2xl shadow-xl">
        {/* Header with neon animation */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Forgot Password
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-black/70 dark:text-white/70 text-center">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading.forgotPassword}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200"
            >
              {loading.forgotPassword ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="flex justify-between mt-4">
            <Link
              to="/login"
              className="text-xs text-black dark:text-white hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
