import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Registration error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/login", { email, password });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/v1/auth/logout");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/forgot-password", { email });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to process forgot password request"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/v1/auth/reset-password/${token}`, {
        password,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.patch("/api/v1/auth/update-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update password"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.patch("/api/v1/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Add a getMe thunk to check if the user is logged in
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/v1/auth/me");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed"
      );
    }
  }
);

// Add updateStreak thunk to maintain user streaks
export const updateStreak = createAsyncThunk(
  "auth/updateStreak",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.patch("/api/v1/user/update-streak");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update streak"
      );
    }
  }
);

// Add getStreakStats thunk to fetch comprehensive streak data
export const getStreakStats = createAsyncThunk(
  "auth/getStreakStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/v1/user/streak-stats");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch streak stats"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: {
      me: true,
      signup: false,
      login: false,
      logout: false,
      forgotPassword: false,
      resetPassword: false,
      updatePassword: false,
      updateProfile: false,
      updateStreak: false,
      getStreakStats: false,
    },
    error: {
      me: null,
      signup: null,
      login: null,
      logout: null,
      forgotPassword: null,
      resetPassword: null,
      updatePassword: null,
      updateProfile: null,
      updateStreak: null,
      getStreakStats: null,
    },
    success: {
      forgotPassword: false,
      resetPassword: false,
      updatePassword: false,
      updateProfile: false,
    },
  },
  reducers: {
    reset: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = {
        me: true,
        signup: false,
        login: false,
        logout: false,
        forgotPassword: false,
        resetPassword: false,
        updatePassword: false,
        updateProfile: false,
        updateStreak: false,
      };
      state.error = {
        me: null,
        signup: null,
        login: null,
        logout: null,
        forgotPassword: null,
        resetPassword: null,
        updatePassword: null,
        updateProfile: null,
        updateStreak: null,
      };
      state.success = {
        forgotPassword: false,
        resetPassword: false,
        updatePassword: false,
        updateProfile: false,
      };
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearErrors: (state) => {
      state.error = {
        me: null,
        signup: null,
        login: null,
        logout: null,
        forgotPassword: null,
        resetPassword: null,
        updatePassword: null,
        updateProfile: null,
        updateStreak: null,
      };
    },
    clearSuccess: (state) => {
      state.success = {
        forgotPassword: false,
        resetPassword: false,
        updatePassword: false,
        updateProfile: false,
      };
    },
  },

  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading.signup = true;
        state.error.signup = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading.signup = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error.signup = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading.signup = false;
        state.error.signup = action.payload;
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.error.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error.login = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.error.login = action.payload;
      })

      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.loading.logout = true;
        state.error.logout = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading.logout = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error.logout = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logout = false;
        state.error.logout = action.payload;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading.forgotPassword = true;
        state.error.forgotPassword = null;
        state.success.forgotPassword = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading.forgotPassword = false;
        state.success.forgotPassword = true;
        state.error.forgotPassword = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading.forgotPassword = false;
        state.error.forgotPassword = action.payload;
        state.success.forgotPassword = false;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading.resetPassword = true;
        state.error.resetPassword = null;
        state.success.resetPassword = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading.resetPassword = false;
        state.success.resetPassword = true;
        state.error.resetPassword = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading.resetPassword = false;
        state.error.resetPassword = action.payload;
        state.success.resetPassword = false;
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading.updatePassword = true;
        state.error.updatePassword = null;
        state.success.updatePassword = false;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading.updatePassword = false;
        state.success.updatePassword = true;
        state.error.updatePassword = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading.updatePassword = false;
        state.error.updatePassword = action.payload;
        state.success.updatePassword = false;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.error.updateProfile = null;
        state.success.updateProfile = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.user = action.payload.data;
        state.success.updateProfile = true;
        state.error.updateProfile = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error.updateProfile = action.payload;
        state.success.updateProfile = false;
      })

      // Get Me (Check Auth Status)
      .addCase(getMe.pending, (state) => {
        state.loading.me = true;
        state.error.me = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading.me = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error.me = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading.me = false;
        state.isAuthenticated = false;
        state.error.me = action.payload;
      })

      // Update Streak
      .addCase(updateStreak.pending, (state) => {
        state.loading.updateStreak = true;
        state.error.updateStreak = null;
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        state.loading.updateStreak = false;
        if (state.user) {
          state.user.currentStreak = action.payload.currentStreak;
          state.user.maxStreak = action.payload.maxStreak;
          state.user.lastActivity =
            action.payload.lastActivity || new Date().toISOString();
        }
        state.error.updateStreak = null;
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.loading.updateStreak = false;
        state.error.updateStreak = action.payload;
      })

      // Get Streak Stats
      .addCase(getStreakStats.pending, (state) => {
        state.loading.getStreakStats = true;
        state.error.getStreakStats = null;
      })
      .addCase(getStreakStats.fulfilled, (state, action) => {
        state.loading.getStreakStats = false;
        if (state.user) {
          state.user.currentStreak = action.payload.data.currentStreak;
          state.user.maxStreak = action.payload.data.maxStreak;
          state.user.totalActiveDays = action.payload.data.totalActiveDays;
          state.user.lastActivity = action.payload.data.lastActivity;
        }
        state.error.getStreakStats = null;
      })
      .addCase(getStreakStats.rejected, (state, action) => {
        state.loading.getStreakStats = false;
        state.error.getStreakStats = action.payload;
      });
  },
});

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;

export const { reset, updateUser, clearErrors, clearSuccess } =
  authSlice.actions;
export default authSlice.reducer;
