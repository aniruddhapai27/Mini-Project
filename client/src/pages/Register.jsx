import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { registerUser } from "../redux/slices/authSlice";

const Register = () => {
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
    resume: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Preview image
      if (name === "profilePic" && file) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Creating your account...");

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      if (formData.profilePic) {
        submitData.append("profilePic", formData.profilePic);
      }
      if (formData.resume) {
        submitData.append("resume", formData.resume);
      }

      // Dispatch register action
      const resultAction = await dispatch(registerUser(submitData));

      // Check if registration was successful
      if (registerUser.fulfilled.match(resultAction)) {
        // Dismiss loading toast and show success toast
        toast.dismiss(loadingToast);
        toast.success("Registration successful! Redirecting to dashboard...");

        // Navigate to dashboard after successful registration
        navigate("/dashboard");
      } else {
        // If rejected, get the error message
        const errorMessage =
          resultAction.payload || "Registration failed. Please try again.";

        // Dismiss loading toast and show error toast
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
      }
    } catch (err) {
      // Dismiss loading toast and show error toast for unexpected errors
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration failed:", err);
    }
  };  return (    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900/50 relative overflow-hidden py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-16 left-16 w-4 h-4 bg-purple-400/30 rotate-45 animate-float-slow"></div>
        <div className="absolute top-24 right-24 w-6 h-6 bg-pink-400/30 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-24 left-24 w-3 h-3 bg-blue-400/30 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-16 right-16 w-5 h-5 bg-cyan-400/30 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-violet-400/40 rotate-45 animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-indigo-400/30 rounded-full animate-float-fast"></div>
        <div className="absolute top-2/3 right-2/3 w-3 h-3 bg-fuchsia-400/30 rotate-45 animate-float-slow"></div>
        
        {/* Hexagon Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon fill="none" stroke="currentColor" strokeWidth="1" points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" className="text-purple-500"/>
          </svg>
        </div>
        
        {/* Animated Lines */}
        <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-0 top-1/5 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent animate-pulse" style={{ animationDelay: "3s" }}></div>
        
        {/* Particle System */}
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-purple-400/60 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-pink-400/60 rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Register Form Container */}
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl relative overflow-hidden z-10">
        {/* Form Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl"></div>
        
        {/* Animated form background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-12 h-12 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-4 right-4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-300 text-sm">Join SkillWise-AI today</p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-cyan-500 transition-colors duration-300 overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs">
                +
              </div>
            </div>
          </div>

          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <label
              htmlFor="resume"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Resume (PDF) - Optional
            </label>
            <div className="relative">
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition-all duration-300"
              />
              <p className="mt-1 text-sm text-gray-400">
                Upload your resume to get personalized interview questions
              </p>
            </div>
          </div>

          {/* Terms and Policy */}
          <div className="text-center text-sm text-gray-400 mt-2">
            By creating an account, you agree to the{" "}
            <Link
              to="/terms"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading.signup}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transform hover:scale-[1.02]"
          >
            {loading.signup ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
