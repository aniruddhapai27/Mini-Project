import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  updateProfile,
  clearSuccess,
  clearErrors,
  getMe,
} from "../redux/slices/authSlice";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DotLottieLoader from "../components/DotLottieLoader";
import QuizPerformanceGraph from "../components/QuizPerformanceGraph";
import GitHubStyleStreakCalendar from "../components/GitHubStyleStreakCalendar";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.auth);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Effect to fetch user data if not available
  useEffect(() => {
    if (!user && !loading.me) {
      dispatch(getMe());
    }
  }, [dispatch, user, loading.me]);

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    profilePic: null,
    resume: null,
  });

  // Sample stats data (would come from the backend in a real app)
  const [stats] = useState({
    averageScore: 85,
    totalSessions: 12,
    currentStreak: user?.currentStreak || 0,
    maxStreak: user?.maxStreak || 0,
    lastSessionDate: "2025-06-01",
    lastActivity: user?.lastActivity || null,
    badges: ["Fast Learner", "Consistent", "Top Performer"],
    categoryScores: {
      hr: 88,
      dataScience: 82,
      webdev: 85,
      fullTechnical: 76,
    },
    recentPerformances: [
      {
        session: "HR Interview",
        score: 92,
        date: "2025-06-01",
        level: "advanced",
      },
      {
        session: "Data Science",
        score: 85,
        date: "2025-05-28",
        level: "intermediate",
      },
      {
        session: "Web Development",
        score: 88,
        date: "2025-05-25",
        level: "intermediate",
      },
      {
        session: "Full Technical",
        score: 78,
        date: "2025-05-22",
        level: "hard",
      },
    ],
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        profilePic: null,
        resume: null,
      });
    }
  }, [user]);

  // Handle success/error states
  useEffect(() => {
    if (success.updateProfile) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setPreviewImage(null);
      dispatch(clearSuccess());
    }
    if (error.updateProfile) {
      toast.error(error.updateProfile);
      dispatch(clearErrors());
    }
  }, [success.updateProfile, error.updateProfile, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Show preview for profile picture
      if (name === "profilePic") {
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required!");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);

    if (formData.profilePic) {
      submitData.append("profilePic", formData.profilePic);
    }

    if (formData.resume) {
      submitData.append("resume", formData.resume);
    }

    await dispatch(updateProfile(submitData));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setFormData({
      name: user?.name || "",
      profilePic: null,
      resume: null,
    });
  };

  const openResumeInNewTab = () => {
    if (user?.resume) {
      window.open(user.resume, "_blank");
    }
  };
  if (!user || loading.me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <DotLottieLoader
          size="w-12 h-12"
          text="Loading profile..."
          textColor="text-gray-400"
        />
      </div>
    );
  }
  // Determine the highest performing category
  const getBestCategory = () => {
    const { hr, dataScience, webdev, fullTechnical } = stats.categoryScores;
    if (hr >= dataScience && hr >= webdev && hr >= fullTechnical)
      return "HR Interview";
    if (
      dataScience >= hr &&
      dataScience >= webdev &&
      dataScience >= fullTechnical
    )
      return "Data Science";
    if (webdev >= hr && webdev >= dataScience && webdev >= fullTechnical)
      return "Web Development";
    return "Full Technical";
  };
  return (
    <div className="min-h-screen py-4 bg-black relative overflow-hidden">
      {/* Pure Black Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle Black Gradient Orbs */}
        <div className="absolute top-1/6 left-1/6 w-96 h-96 bg-gradient-to-br from-gray-900/20 to-black rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/6 right-1/6 w-80 h-80 bg-gradient-to-br from-gray-800/15 to-black rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-700/10 to-black rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-12">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-profile"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-profile)" />
          </svg>
        </div>
        {/* Diamond Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="diamond"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  points="20,5 35,20 20,35 5,20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamond)" />
          </svg>
        </div>
        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="circuit-profile"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,50 L25,50 M75,50 L100,50 M50,0 L50,25 M50,75 L50,100"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle cx="25" cy="50" r="2" fill="white" opacity="0.2" />
                <circle cx="75" cy="50" r="2" fill="white" opacity="0.2" />
                <circle cx="50" cy="25" r="2" fill="white" opacity="0.2" />
                <circle cx="50" cy="75" r="2" fill="white" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-profile)" />
          </svg>
        </div>
        {/* Geometric Floating Shapes - Pure Black/Gray */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-gray-800/35 rotate-45 animate-float-slow"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-gray-700/30 animate-float-medium"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-gray-600/30 rotate-45 animate-float-fast"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-gray-800/25 animate-float-slow"></div>{" "}
        <div className="absolute top-1/4 right-1/3 w-1 h-6 bg-gray-700/25 animate-float-medium"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-1 bg-gray-600/25 animate-float-fast"></div>
        {/* Subtle Gradient Lines */}
        <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-transparent via-gray-700/25 to-transparent animate-pulse"></div>
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-600/20 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute left-0 top-1/5 w-full h-px bg-gradient-to-r from-transparent via-gray-700/25 to-transparent animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-gray-600/20 to-transparent animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Content with backdrop filter */}
      <div className="relative z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Profile
            </h1>
          </div>

          {/* Main Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden h-full">
                {/* Animated background elements - smaller size */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-3 left-3 w-8 h-8 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                  <div
                    className="absolute bottom-3 right-3 w-10 h-10 bg-purple-500/10 rounded-full blur-xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                <div className="relative z-10">
                  {/* Profile Picture and Info Section */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative group mb-3">
                      <div className="w-20 h-20 relative">
                        {/* Neon border */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full p-0.5 animate-spin-slow">
                          <div className="w-full h-full bg-gray-900 rounded-full"></div>
                        </div>

                        {/* Profile image */}
                        <div className="absolute inset-1.5 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                          {previewImage || user.profilePic ? (
                            <img
                              src={previewImage || user.profilePic}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </span>
                          )}
                        </div>

                        {/* Edit overlay */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer group-hover:bg-black/70 transition-all duration-300">
                            <input
                              type="file"
                              name="profilePic"
                              accept="image/*"
                              onChange={handleInputChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-white text-center">
                              <svg
                                className="w-6 h-6 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* User Info */}
                    <div className="text-center">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="text-2xl font-bold bg-transparent border-b-2 border-cyan-500 text-white focus:outline-none focus:border-purple-500 transition-colors duration-300 mb-2 w-full text-center"
                          placeholder="Enter your name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                          {user.name}
                        </h2>
                      )}

                      <p className="text-md text-gray-300 mb-3 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2 text-cyan-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        {user.email}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap justify-center gap-2 mb-5">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                          ✅ Active User
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium">
                          🚀 Interview Ready
                        </span>
                      </div>
                    </div>{" "}
                    {/* Resume Section - Compact */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-cyan-500/30 rounded-xl p-2 mb-3 w-full">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xs font-semibold text-white flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 text-cyan-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                          </svg>
                          Resume
                        </h3>
                        {user.resume && !isEditing && (
                          <button
                            onClick={openResumeInNewTab}
                            className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 text-[10px] font-medium"
                          >
                            View
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-2 text-center hover:border-cyan-500/60 transition-all duration-300">
                          <input
                            type="file"
                            name="resume"
                            accept=".pdf"
                            onChange={handleInputChange}
                            className="w-full text-gray-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gradient-to-r file:from-cyan-500 file:to-purple-500 file:text-white hover:file:from-cyan-600 hover:file:to-purple-600 transition-all duration-300"
                          />
                          <p className="mt-1 text-xs text-gray-400">
                            Upload a PDF resume
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {user.resume ? (
                            <div className="flex items-center text-gray-300 text-xs">
                              <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span>Resume uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400 text-xs">
                              <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                <svg
                                  className="w-3 h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </div>
                              <span>No resume uploaded</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>{" "}
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex justify-center gap-2 w-full">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              disabled={loading.updateProfile}
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 shadow-lg text-[10px] flex-1"
                            >
                              {loading.updateProfile ? (
                                <DotLottieLoader
                                  size="w-3 h-3"
                                  text="Saving..."
                                  layout="horizontal"
                                  textSize="text-xs"
                                  textColor="text-white"
                                />
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={loading.updateProfile}
                              className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 shadow-lg text-[10px] flex-1"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg text-[10px] w-full"
                          >
                            ✏️ Edit Profile
                          </button>
                        )}
                      </div>

                      {/* Change Password Button */}
                      {!isEditing && (
                        <button
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg text-[10px] w-full flex items-center justify-center"
                        >
                          🔒 Change Password
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Right Column: Stats and Performance */}
            <div className="lg:col-span-2">
              {/* GitHub-style Streak Calendar */}
              <div className="mb-6">
                <GitHubStyleStreakCalendar />
              </div>
              {/* Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {user?.currentStreak || 0}
                  </div>
                  <div className="text-gray-400 text-xs">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-xl font-bold text-purple-400">
                    {stats.totalSessions}
                  </div>
                  <div className="text-gray-400 text-xs">Total Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-xl font-bold text-green-400">
                    {stats.averageScore}%
                  </div>
                  <div className="text-gray-400 text-xs">Average Score</div>
                </div>
              </div>
              {/* Performance Graph */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-3">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Performance by Category
                </h3>{" "}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>HR Interview</span>
                      <span>{stats.categoryScores.hr}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${stats.categoryScores.hr}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Data Science</span>
                      <span>{stats.categoryScores.dataScience}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{
                          width: `${stats.categoryScores.dataScience}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Web Development</span>
                      <span>{stats.categoryScores.webdev}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                        style={{ width: `${stats.categoryScores.webdev}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Full Technical</span>
                      <span>{stats.categoryScores.fullTechnical}%</span>
                    </div>{" "}
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        style={{
                          width: `${stats.categoryScores.fullTechnical}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quiz Performance Graph */}
              <QuizPerformanceGraph />
              {/* Recent Performance */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {stats.recentPerformances.map((performance, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {performance.session}
                          <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded-full text-gray-300 text-xs">
                            {performance.level}
                          </span>
                        </p>
                        <p className="text-gray-400 text-xs">
                          {performance.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            performance.score >= 90
                              ? "text-green-400"
                              : performance.score >= 80
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {performance.score}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* User Insights */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Your Insights
                </h3>
                <p className="text-gray-300 text-sm">
                  Your strongest area is{" "}
                  <span className="text-cyan-400 font-medium">
                    {getBestCategory()}
                  </span>
                  . You've completed{" "}
                  <span className="text-purple-400 font-medium">
                    {stats.totalSessions} sessions
                  </span>{" "}
                  with an average score of{" "}
                  <span className="text-green-400 font-medium">
                    {stats.averageScore}%
                  </span>
                  . Keep up your{" "}
                  <span className="text-yellow-400 font-medium">
                    {stats.currentStreak}-day streak
                  </span>{" "}
                  to improve your interview skills!
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
