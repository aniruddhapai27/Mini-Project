import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  updateProfile,
  clearSuccess,
  clearErrors,
  getMe,
} from "../redux/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.auth);

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
    currentStreak: 3,
    maxStreak: 5,
    lastSessionDate: "2025-06-01",
    badges: ["Fast Learner", "Consistent", "Top Performer"],
    categoryScores: {
      technical: 88,
      behavioral: 82,
      systemDesign: 76,
    },
    recentPerformances: [
      {
        session: "Technical",
        score: 92,
        date: "2025-06-01",
        level: "advanced",
      },
      {
        session: "Behavioral",
        score: 85,
        date: "2025-05-28",
        level: "intermediate",
      },
      {
        session: "System Design",
        score: 78,
        date: "2025-05-25",
        level: "intermediate",
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Determine the highest performing category
  const getBestCategory = () => {
    const { technical, behavioral, systemDesign } = stats.categoryScores;
    if (technical >= behavioral && technical >= systemDesign)
      return "Technical";
    if (behavioral >= technical && behavioral >= systemDesign)
      return "Behavioral";
    return "System Design";
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header with compact neon animation */}
        <div className="text-center mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl animate-pulse"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10 animate-pulse">
            ⚡ PROFILE ⚡
          </h1>
          <div className="flex justify-center items-center space-x-2 mt-1 relative z-10">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
            <div
              className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        {/* Main Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden h-full">
              {/* Animated background elements - smaller size */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-5 left-5 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                <div
                  className="absolute bottom-5 right-5 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>

              <div className="relative z-10">
                {/* Profile Picture and Info Section */}
                <div className="flex flex-col items-center mb-5">
                  <div className="relative group mb-4">
                    <div className="w-24 h-24 relative">
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
                  </div>

                  {/* Resume Section - Compact */}
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-cyan-500/30 rounded-xl p-3 mb-5 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white flex items-center">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Resume
                      </h3>
                      {user.resume && !isEditing && (
                        <button
                          onClick={openResumeInNewTab}
                          className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 text-xs font-medium"
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 w-full">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={loading.updateProfile}
                          className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs flex-1"
                        >
                          {loading.updateProfile ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              <span>Saving...</span>
                            </div>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={loading.updateProfile}
                          className="px-4 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs flex-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg text-xs w-full"
                      >
                        ✏️ Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats and Performance */}
          <div className="lg:col-span-2">
            {/* Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">🔥</div>
                <div className="text-xl font-bold text-cyan-400">
                  {stats.currentStreak}
                </div>
                <div className="text-gray-400 text-xs">Current Streak</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">🏆</div>
                <div className="text-xl font-bold text-purple-400">
                  {stats.totalSessions}
                </div>
                <div className="text-gray-400 text-xs">Total Sessions</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">⭐</div>
                <div className="text-xl font-bold text-green-400">
                  {stats.averageScore}%
                </div>
                <div className="text-gray-400 text-xs">Average Score</div>
              </div>
            </div>

            {/* Performance Graph */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Performance by Category
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Technical</span>
                    <span>{stats.categoryScores.technical}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${stats.categoryScores.technical}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Behavioral</span>
                    <span>{stats.categoryScores.behavioral}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${stats.categoryScores.behavioral}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>System Design</span>
                    <span>{stats.categoryScores.systemDesign}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${stats.categoryScores.systemDesign}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
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
              <div className="space-y-2">
                {stats.recentPerformances.map((performance, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-xs font-medium">
                        {performance.session}
                        <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded-full text-gray-300 text-[10px]">
                          {performance.level}
                        </span>
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {performance.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-semibold ${
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
            <div className="mt-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center">
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
              <p className="text-gray-300 text-xs">
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
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
