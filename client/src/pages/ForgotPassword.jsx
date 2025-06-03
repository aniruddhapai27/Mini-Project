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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-xl">
        {/* Header with neon animation */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10">
            Forgot Password
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 text-center">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading.forgotPassword}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading.forgotPassword ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Sending Instructions...</span>
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
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
