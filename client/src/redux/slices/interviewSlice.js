import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

// Async thunks for interview operations
export const createInterviewSession = createAsyncThunk(
  "interview/createSession",
  async ({ domain, difficulty }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/interview/sessions", {
        domain,
        difficulty,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create interview session"
      );
    }
  }
);

export const getInterviewSession = createAsyncThunk(
  "interview/getSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/interview/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch interview session"
      );
    }
  }
);

export const updateInterviewSession = createAsyncThunk(
  "interview/updateSession",
  async ({ sessionId, bot, user }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/v1/interview/sessions/${sessionId}`,
        {
          bot,
          user,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update interview session"
      );
    }
  }
);

export const endInterviewSession = createAsyncThunk(
  "interview/endSession",
  async ({ sessionId, finalScore, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/v1/interview/sessions/${sessionId}/end`,
        {
          finalScore,
          feedback,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to end interview session"
      );
    }
  }
);

export const getInterviewStats = createAsyncThunk(
  "interview/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/interview/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch interview stats"
      );
    }
  }
);

export const getRecentInterviews = createAsyncThunk(
  "interview/getRecent",
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/interview/recent?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent interviews"
      );
    }
  }
);

// New AI-powered interview thunk
export const sendInterviewMessage = createAsyncThunk(
  "interview/sendMessage",
  async (
    { domain, difficulty, userResponse, sessionId, useResume = true },
    { rejectWithValue }
  ) => {
    try {
      if (!sessionId) {
        // First message - create new interview session
        const response = await api.post("/api/v1/interview/sessions", {
          domain,
          difficulty,
          useResume, // Include useResume flag in the API request
        });

        return {
          aiResponse:
            response.data?.data?.firstQuestion ||
            "Hello! Let's start the interview.",
          sessionId: response.data?.data?.sessionId,
          userMessage: "Hello, I am ready to start the interview.",
          isFirstMessage: true,
          resumeUsed: response.data?.data?.resumeUsed || false,
        };
      } else {
        // Continue existing interview session
        const response = await api.patch(
          `/api/v1/interview/sessions/${sessionId}`,
          {
            userResponse: userResponse,
          }
        );

        return {
          aiResponse:
            response.data?.data?.question || "Thank you for your response.",
          sessionId: sessionId,
          userMessage: userResponse,
          isFirstMessage: false,
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send interview message"
      );
    }
  }
);

// Get AI-generated interview feedback
export const getInterviewFeedback = createAsyncThunk(
  "interview/getFeedback",
  async (sessionId, { rejectWithValue, getState }) => {
    try {
      console.log("🔄 Redux: Requesting feedback for session:", sessionId);

      // Check if feedback already exists in cache
      const state = getState();
      const cachedFeedback = state.interview.sessionFeedbacks[sessionId];
      if (cachedFeedback) {
        console.log(
          "📦 Redux: Returning cached feedback for session:",
          sessionId
        );
        return {
          sessionId,
          feedback: cachedFeedback,
          fromCache: true,
        };
      }

      const response = await api.get(
        `/api/v1/interview/sessions/${sessionId}/feedback`
      );
      console.log("✅ Redux: Feedback response received:", response.data);

      return {
        sessionId,
        feedback: response.data.data,
        fromCache: false,
      };
    } catch (error) {
      console.error(
        "❌ Redux: Feedback request failed:",
        error.response?.data || error.message
      );
      return rejectWithValue({
        sessionId,
        error:
          error.response?.data?.message || "Failed to get interview feedback",
        details: error.response?.data || error.message,
      });
    }
  }
);

// End interview session with feedback
export const endInterviewWithFeedback = createAsyncThunk(
  "interview/endWithFeedback",
  async ({ sessionId, finalScore }, { dispatch, rejectWithValue }) => {
    try {
      console.log(
        "🔄 Redux: Ending interview and requesting feedback for:",
        sessionId
      );

      // First end the interview session
      const endResponse = await api.patch(
        `/api/v1/interview/sessions/${sessionId}/end`,
        {
          finalScore: finalScore || 0,
        }
      );
      console.log("✅ Redux: Interview ended successfully");

      // Then get feedback
      const feedbackResult = await dispatch(getInterviewFeedback(sessionId));

      if (feedbackResult.meta.requestStatus === "fulfilled") {
        console.log(
          "✅ Redux: Complete interview end with feedback successful"
        );
        return {
          sessionData: endResponse.data.data,
          feedback: feedbackResult.payload.feedback,
          sessionId,
        };
      } else {
        console.log("⚠️ Redux: Interview ended but feedback failed");
        return {
          sessionData: endResponse.data.data,
          feedback: null,
          feedbackError: feedbackResult.payload?.error,
          sessionId,
        };
      }
    } catch (error) {
      console.error("❌ Redux: Failed to end interview with feedback:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to end interview with feedback"
      );
    }
  }
);

// Fetch interview history
export const fetchInterviewHistory = createAsyncThunk(
  "interview/fetchHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/interview/history`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch interview history"
      );
    }
  }
);

export const deleteInterviewSession = createAsyncThunk(
  "interview/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/api/v1/interview/sessions/${sessionId}`
      );
      return { sessionId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete interview session"
      );
    }
  }
);

// Initial state
const initialState = {
  // Current interview session
  currentSession: null,
  sessionLoading: false,
  sessionError: null,

  // AI Interview conversation
  conversation: [],
  currentSessionId: null,
  interviewStarted: false,
  aiResponseLoading: false,
  aiResponseError: null,

  // Interview progress
  currentQuestionIndex: 0,
  userResponse: "",
  isWaitingForAI: false,

  // Interview history
  interviewHistory: [],
  totalPages: 0,
  currentPage: 1,
  totalInterviews: 0,
  historyLoading: false,
  historyError: null,

  // Interview session deletion
  deleteSessionLoading: false,
  deleteSessionError: null,
  deletingSessionId: null,

  // Enhanced pagination metadata
  pagination: {
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Gamification elements
  streakCount: 0,
  totalXP: 0,
  level: 1,
  achievements: [],

  // Stats
  stats: {
    totalInterviews: 0,
    averageScore: 0,
    totalQuestions: 0,
    domainBreakdown: [],
    difficultyBreakdown: [],
  },
  statsLoading: false,
  statsError: null,

  // Recent interviews
  recentInterviews: [],
  recentLoading: false,
  recentError: null,

  // Interview creation
  createLoading: false,
  createError: null,

  // Interview update
  updateLoading: false,
  updateError: null,

  // Interview completion
  completedSessions: [],

  // Interview feedback
  feedback: null,
  feedbackLoading: false,
  feedbackError: null,
  feedbackSessionId: null, // Track which session has feedback

  // Session feedback cache - store feedback for multiple sessions
  sessionFeedbacks: {}, // { sessionId: feedback }

  // Interview completion state
  interviewEndLoading: false,
  interviewEndError: null,

  // UI state
  showStreakAnimation: false,
  showLevelUpAnimation: false,
  showAchievementAnimation: null,
};

// Helper functions for gamification
const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

const calculateXPGain = (score, difficulty) => {
  const baseXP = 10;
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };
  const scoreMultiplier = score / 100;

  return Math.floor(
    baseXP * difficultyMultiplier[difficulty] * scoreMultiplier
  );
};

const checkAchievements = (state) => {
  const newAchievements = [];

  // First interview achievement
  if (state.stats.totalInterviews === 1) {
    newAchievements.push({
      id: "first_interview",
      name: "Getting Started",
      description: "Complete your first mock interview",
      icon: "🚀",
      earnedAt: new Date().toISOString(),
    });
  }

  // Streak achievements
  if (state.streakCount === 3) {
    newAchievements.push({
      id: "streak_3",
      name: "On Fire",
      description: "Complete 3 interviews in a row",
      icon: "🔥",
      earnedAt: new Date().toISOString(),
    });
  }

  // Score achievements
  if (state.currentSession?.score >= 90) {
    newAchievements.push({
      id: "high_scorer",
      name: "Excellence",
      description: "Score 90% or higher in an interview",
      icon: "⭐",
      earnedAt: new Date().toISOString(),
    });
  }

  return newAchievements;
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    // Session management
    resetCurrentSession: (state) => {
      state.currentSession = null;
      state.currentQuestionIndex = 0;
      state.userResponse = "";
      state.isWaitingForAI = false;
      state.sessionError = null;
    },

    setUserResponse: (state, action) => {
      state.userResponse = action.payload;
    },

    setWaitingForAI: (state, action) => {
      state.isWaitingForAI = action.payload;
    },

    nextQuestion: (state) => {
      if (state.currentSession?.QnA) {
        state.currentQuestionIndex = state.currentSession.QnA.length - 1;
      }
      state.userResponse = "";
    },

    // Gamification actions
    incrementStreak: (state) => {
      state.streakCount += 1;
      state.showStreakAnimation = true;
    },

    resetStreak: (state) => {
      state.streakCount = 0;
    },

    addXP: (state, action) => {
      const { score, difficulty } = action.payload;
      const xpGain = calculateXPGain(score, difficulty);
      const oldLevel = state.level;

      state.totalXP += xpGain;
      state.level = calculateLevel(state.totalXP);

      if (state.level > oldLevel) {
        state.showLevelUpAnimation = true;
      }
    },

    addAchievement: (state, action) => {
      const achievement = action.payload;
      if (!state.achievements.find((a) => a.id === achievement.id)) {
        state.achievements.push(achievement);
        state.showAchievementAnimation = achievement;
      }
    },

    // UI actions
    hideStreakAnimation: (state) => {
      state.showStreakAnimation = false;
    },

    hideLevelUpAnimation: (state) => {
      state.showLevelUpAnimation = false;
    },

    hideAchievementAnimation: (state) => {
      state.showAchievementAnimation = false;
    },

    // Add user message immediately (for better UX)
    addUserMessage: (state, action) => {
      state.conversation.push({
        type: "user",
        message: action.payload.message,
        timestamp: action.payload.timestamp,
        immediate: true,
      });
    },

    // Clear errors
    clearSessionError: (state) => {
      state.sessionError = null;
    },

    clearCreateError: (state) => {
      state.createError = null;
    },

    clearUpdateError: (state) => {
      state.updateError = null;
    },

    clearStatsError: (state) => {
      state.statsError = null;
    },
    clearRecentError: (state) => {
      state.recentError = null;
    },

    // Feedback management actions
    clearFeedbackError: (state) => {
      state.feedbackError = null;
    },

    setFeedbackForSession: (state, action) => {
      const { sessionId, feedback } = action.payload;
      state.sessionFeedbacks[sessionId] = feedback;

      if (sessionId === state.currentSession?._id) {
        state.feedback = feedback;
        state.feedbackSessionId = sessionId;
        if (state.currentSession) {
          state.currentSession.feedback = feedback;
        }
      }
    },

    getFeedbackFromCache: (state, action) => {
      const sessionId = action.payload;
      const cachedFeedback = state.sessionFeedbacks[sessionId];

      if (cachedFeedback) {
        state.feedback = cachedFeedback;
        state.feedbackSessionId = sessionId;
      }
    },

    clearFeedback: (state) => {
      state.feedback = null;
      state.feedbackSessionId = null;
      state.feedbackError = null;
    },

    clearInterviewEndError: (state) => {
      state.interviewEndError = null;
    },

    // AI Interview management
    startInterview: (state) => {
      state.interviewStarted = true;
      state.conversation = [];
      state.currentSessionId = null;
      state.aiResponseError = null;
    },

    addAIMessage: (state, action) => {
      state.conversation.push({
        type: "ai",
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    setCurrentSessionId: (state, action) => {
      state.currentSessionId = action.payload;
    },

    resetInterview: (state) => {
      state.interviewStarted = false;
      state.conversation = [];
      state.currentSessionId = null;
      state.userResponse = "";
      state.aiResponseLoading = false;
      state.aiResponseError = null;
    },

    clearAiResponseError: (state) => {
      state.aiResponseError = null;
    },

    setAiResponseLoading: (state, action) => {
      state.aiResponseLoading = action.payload;
    },

    // Pagination management
    setPageSize: (state, action) => {
      const newLimit = action.payload;
      if (newLimit >= 1 && newLimit <= 50) {
        state.pagination.limit = newLimit;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Create interview session
      .addCase(createInterviewSession.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createInterviewSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentSession = {
          ...action.payload,
          QnA: [],
        };
        state.currentQuestionIndex = 0;
        state.userResponse = "";
      })
      .addCase(createInterviewSession.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Get interview session
      .addCase(getInterviewSession.pending, (state) => {
        state.sessionLoading = true;
        state.sessionError = null;
      })
      .addCase(getInterviewSession.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.currentSession = action.payload;
        state.currentQuestionIndex = action.payload.QnA?.length || 0;
      })
      .addCase(getInterviewSession.rejected, (state, action) => {
        state.sessionLoading = false;
        state.sessionError = action.payload;
      })

      // Update interview session
      .addCase(updateInterviewSession.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.isWaitingForAI = true;
      })
      .addCase(updateInterviewSession.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.isWaitingForAI = false;

        if (state.currentSession) {
          state.currentSession.QnA = state.currentSession.QnA || [];
          state.currentSession.QnA.push(action.payload.latestQnA);
          state.currentQuestionIndex = state.currentSession.QnA.length;
        }

        state.userResponse = "";
      })
      .addCase(updateInterviewSession.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.isWaitingForAI = false;
      })

      // End interview session
      .addCase(endInterviewSession.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(endInterviewSession.fulfilled, (state, action) => {
        state.updateLoading = false;

        if (state.currentSession) {
          state.currentSession.score = action.payload.finalScore;
          state.currentSession.feedBack = action.payload.feedback;

          // Add gamification elements
          const xpGain = calculateXPGain(
            action.payload.finalScore,
            state.currentSession.difficulty
          );
          const oldLevel = state.level;

          state.totalXP += xpGain;
          state.level = calculateLevel(state.totalXP);

          if (state.level > oldLevel) {
            state.showLevelUpAnimation = true;
          }

          // Check for achievements
          const newAchievements = checkAchievements(state);
          newAchievements.forEach((achievement) => {
            if (!state.achievements.find((a) => a.id === achievement.id)) {
              state.achievements.push(achievement);
              state.showAchievementAnimation = achievement;
            }
          });

          // Update streak
          if (action.payload.finalScore >= 70) {
            state.streakCount += 1;
            state.showStreakAnimation = true;
          } else {
            state.streakCount = 0;
          }

          // Add to completed sessions
          state.completedSessions.push({
            ...state.currentSession,
            completedAt: new Date().toISOString(),
          });
        }
      })
      .addCase(endInterviewSession.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Get interview stats
      .addCase(getInterviewStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getInterviewStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.overview || state.stats;
      })
      .addCase(getInterviewStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // Get recent interviews
      .addCase(getRecentInterviews.pending, (state) => {
        state.recentLoading = true;
        state.recentError = null;
      })
      .addCase(getRecentInterviews.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentInterviews = action.payload;
      })
      .addCase(getRecentInterviews.rejected, (state, action) => {
        state.recentLoading = false;
        state.recentError = action.payload;
      })
      // Send interview message (AI Interview)
      .addCase(sendInterviewMessage.pending, (state) => {
        state.aiResponseLoading = true;
        state.aiResponseError = null;
        state.isWaitingForAI = true;
      })
      .addCase(sendInterviewMessage.fulfilled, (state, action) => {
        state.aiResponseLoading = false;
        state.isWaitingForAI = false;

        const { aiResponse, sessionId, isFirstMessage } = action.payload; // Removed unused userMessage variable

        // Set session ID if this is the first response
        if (sessionId && !state.currentSessionId) {
          state.currentSessionId = sessionId;
        }

        // For first message, only add AI response (user message is generic)
        if (isFirstMessage) {
          // Clear any existing conversation
          state.conversation = [];

          // Add initial AI response
          state.conversation.push({
            type: "ai",
            message: aiResponse,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Don't add the user message here since it's already added immediately by the UI
          // We only need to add the AI response
          state.conversation.push({
            type: "ai",
            message: aiResponse,
            timestamp: new Date().toISOString(),
          });
        }

        // Clear user response
        state.userResponse = "";
      })
      .addCase(sendInterviewMessage.rejected, (state, action) => {
        state.aiResponseLoading = false;
        state.isWaitingForAI = false;
        state.aiResponseError = action.payload;
      })
      // Get interview feedback
      .addCase(getInterviewFeedback.pending, (state) => {
        state.feedbackLoading = true;
        state.feedbackError = null;
      })
      .addCase(getInterviewFeedback.fulfilled, (state, action) => {
        const { sessionId, feedback, fromCache } = action.payload;
        state.feedbackLoading = false;

        // Always update current feedback and cache
        state.feedback = feedback;
        state.feedbackSessionId = sessionId;
        state.sessionFeedbacks[sessionId] = feedback;

        // Update current session if it matches
        if (state.currentSession && state.currentSession._id === sessionId) {
          state.currentSession.feedback = feedback;
        }

        console.log(
          `✅ Redux: Feedback ${
            fromCache ? "loaded from cache" : "fetched"
          } for session ${sessionId}`
        );
      })
      .addCase(getInterviewFeedback.rejected, (state, action) => {
        const { sessionId, error } = action.payload;
        state.feedbackLoading = false;
        state.feedbackError = error;
        console.error(
          `❌ Redux: Feedback failed for session ${sessionId}:`,
          error
        );
      })

      // End interview with feedback
      .addCase(endInterviewWithFeedback.pending, (state) => {
        state.interviewEndLoading = true;
        state.interviewEndError = null;
        state.feedbackLoading = true;
      })
      .addCase(endInterviewWithFeedback.fulfilled, (state, action) => {
        const { sessionData, feedback, feedbackError, sessionId } =
          action.payload;
        state.interviewEndLoading = false;
        state.feedbackLoading = false;

        // Update session data
        if (sessionData && sessionId) {
          if (state.currentSession && state.currentSession._id === sessionId) {
            state.currentSession = { ...state.currentSession, ...sessionData };
          }
        }

        // Handle feedback
        if (feedback && sessionId) {
          state.feedback = feedback;
          state.feedbackSessionId = sessionId;
          state.sessionFeedbacks[sessionId] = feedback;

          if (state.currentSession && state.currentSession._id === sessionId) {
            state.currentSession.feedback = feedback;
          }
        } else if (feedbackError) {
          state.feedbackError = feedbackError;
        }
      })
      .addCase(endInterviewWithFeedback.rejected, (state, action) => {
        state.interviewEndLoading = false;
        state.feedbackLoading = false;
        state.interviewEndError = action.payload?.error || action.error.message;
        console.error("❌ Redux: End interview with feedback failed:", action);
      })

      // Fetch interview history
      .addCase(fetchInterviewHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchInterviewHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.interviewHistory = action.payload.interviews;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalInterviews = action.payload.totalInterviews;

        // Update enhanced pagination metadata if available
        if (action.payload.pagination) {
          state.pagination = {
            limit: action.payload.pagination.limit,
            hasNextPage: action.payload.pagination.hasNextPage,
            hasPrevPage: action.payload.pagination.hasPrevPage,
          };
        }
      })
      .addCase(fetchInterviewHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload || action.error.message;
        console.error("❌ Redux: Failed to fetch interview history:", action);
      })

      // Delete interview session
      .addCase(deleteInterviewSession.pending, (state, action) => {
        state.deleteSessionLoading = true;
        state.deleteSessionError = null;
        state.deletingSessionId = action.meta.arg; // Store the session ID being deleted
      })
      .addCase(deleteInterviewSession.fulfilled, (state, action) => {
        state.deleteSessionLoading = false;
        state.deletingSessionId = null;
        const deletedSessionId = action.payload.sessionId;

        // Remove the deleted session from interview history
        state.interviewHistory = state.interviewHistory.filter(
          (interview) => interview._id !== deletedSessionId
        );

        // Update total count
        if (state.totalInterviews > 0) {
          state.totalInterviews -= 1;
        }

        // Clear session feedback cache for the deleted session
        if (state.sessionFeedbacks[deletedSessionId]) {
          delete state.sessionFeedbacks[deletedSessionId];
        }
      })
      .addCase(deleteInterviewSession.rejected, (state, action) => {
        state.deleteSessionLoading = false;
        state.deleteSessionError = action.payload || action.error.message;
        state.deletingSessionId = null;
        console.error("❌ Redux: Failed to delete interview session:", action);
      });
  },
});

// Export actions
export const {
  resetCurrentSession,
  setUserResponse,
  setWaitingForAI,
  nextQuestion,
  incrementStreak,
  resetStreak,
  addXP,
  addAchievement,
  hideStreakAnimation,
  hideLevelUpAnimation,
  hideAchievementAnimation,
  clearSessionError,
  clearCreateError,
  clearUpdateError,
  clearStatsError,
  clearRecentError,
  clearFeedbackError,
  setFeedbackForSession,
  getFeedbackFromCache,
  clearFeedback,
  clearInterviewEndError,
  startInterview,
  addUserMessage,
  addAIMessage,
  setCurrentSessionId,
  resetInterview,
  clearAiResponseError,
  setAiResponseLoading,
  setPageSize,
} = interviewSlice.actions;

// Selectors
export const selectCurrentSession = (state) => state.interview.currentSession;
export const selectSessionLoading = (state) => state.interview.sessionLoading;
export const selectSessionError = (state) => state.interview.sessionError;
export const selectCurrentQuestionIndex = (state) =>
  state.interview.currentQuestionIndex;
export const selectUserResponse = (state) => state.interview.userResponse;
export const selectIsWaitingForAI = (state) => state.interview.isWaitingForAI;

// Gamification selectors
export const selectStreakCount = (state) => state.interview.streakCount;
export const selectTotalXP = (state) => state.interview.totalXP;
export const selectLevel = (state) => state.interview.level;
export const selectAchievements = (state) => state.interview.achievements;
export const selectShowStreakAnimation = (state) =>
  state.interview.showStreakAnimation;
export const selectShowLevelUpAnimation = (state) =>
  state.interview.showLevelUpAnimation;
export const selectShowAchievementAnimation = (state) =>
  state.interview.showAchievementAnimation;

// Stats selectors
export const selectInterviewStats = (state) => state.interview.stats;
export const selectStatsLoading = (state) => state.interview.statsLoading;
export const selectStatsError = (state) => state.interview.statsError;

// Recent interviews selectors
export const selectRecentInterviews = (state) =>
  state.interview.recentInterviews;
export const selectRecentLoading = (state) => state.interview.recentLoading;
export const selectRecentError = (state) => state.interview.recentError;

// Loading selectors
export const selectCreateLoading = (state) => state.interview.createLoading;
export const selectCreateError = (state) => state.interview.createError;
export const selectUpdateLoading = (state) => state.interview.updateLoading;
export const selectUpdateError = (state) => state.interview.updateError;

// Completed sessions selector
export const selectCompletedSessions = (state) =>
  state.interview.completedSessions;

// AI Interview selectors
export const selectConversation = (state) => state.interview.conversation;
export const selectCurrentSessionId = (state) =>
  state.interview.currentSessionId;
export const selectInterviewStarted = (state) =>
  state.interview.interviewStarted;
export const selectAiResponseLoading = (state) =>
  state.interview.aiResponseLoading;
export const selectAiResponseError = (state) => state.interview.aiResponseError;

// Feedback selectors
export const selectFeedback = (state) => state.interview.feedback;
export const selectFeedbackLoading = (state) => state.interview.feedbackLoading;
export const selectFeedbackError = (state) => state.interview.feedbackError;
export const selectFeedbackSessionId = (state) =>
  state.interview.feedbackSessionId;
export const selectSessionFeedbacks = (state) =>
  state.interview.sessionFeedbacks;

// Get feedback for specific session
export const selectFeedbackForSession = (sessionId) => (state) =>
  state.interview.sessionFeedbacks[sessionId] || null;

// Check if feedback is available for session
export const selectHasFeedbackForSession = (sessionId) => (state) =>
  !!state.interview.sessionFeedbacks[sessionId];

// Interview end selectors
export const selectInterviewEndLoading = (state) =>
  state.interview.interviewEndLoading;
export const selectInterviewEndError = (state) =>
  state.interview.interviewEndError;

// Interview history selectors
export const selectInterviewHistory = (state) =>
  state.interview.interviewHistory;
export const selectHistoryLoading = (state) => state.interview.historyLoading;
export const selectHistoryError = (state) => state.interview.historyError;
export const selectHistoryTotalPages = (state) => state.interview.totalPages;
export const selectHistoryCurrentPage = (state) => state.interview.currentPage;
export const selectHistoryTotalInterviews = (state) =>
  state.interview.totalInterviews;
export const selectHistoryPageSize = (state) =>
  state.interview.pagination.limit;

// Interview session deletion selectors
export const selectDeleteSessionLoading = (state) =>
  state.interview.deleteSessionLoading;
export const selectDeleteSessionError = (state) =>
  state.interview.deleteSessionError;
export const selectDeletingSessionId = (state) =>
  state.interview.deletingSessionId;

export default interviewSlice.reducer;
