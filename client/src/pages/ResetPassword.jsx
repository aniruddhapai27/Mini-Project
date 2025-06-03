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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-xl">
        {/* Header with neon animation */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10">
            Reset Password
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 text-center">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300 block mb-2"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-300 block mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading.resetPassword}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading.resetPassword ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
