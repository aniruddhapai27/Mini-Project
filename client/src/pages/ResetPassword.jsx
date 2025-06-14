import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  resetPassword,
  clearErrors,
  clearSuccess,
} from "../redux/slices/authSlice";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.auth);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    await dispatch(resetPassword({ token, password }));
  };

  // Handle success/error responses
  useEffect(() => {
    if (success.resetPassword) {
      toast.success("Password successfully reset!");
      dispatch(clearSuccess());
      // Redirect to login page after successful password reset
      setTimeout(() => navigate("/login"), 2000);
    }

    if (error.resetPassword) {
      toast.error(error.resetPassword);
      dispatch(clearErrors());
    }
  }, [success.resetPassword, error.resetPassword, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Reset Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black dark:text-white"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-black dark:text-white"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading.resetPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200"
          >
            {loading.resetPassword ? "Resetting..." : "Reset Password"}
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
  );
};

export default ResetPassword;
