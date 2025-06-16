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
    { domain, difficulty, userResponse, sessionId, resumeFile },
    { rejectWithValue }
  ) => {
    try {
      if (!sessionId) {
        // First message - create new interview session
        const formData = new FormData();

        // Add resume file (create default if not provided)
        if (resumeFile) {
          formData.append("resume", resumeFile);
        } else {
          const defaultResume = new Blob(
            ["Sample resume content for interview"],
            { type: "text/plain" }
          );
          formData.append("resume", defaultResume, "resume.txt");
        }

        formData.append("domain", domain);
        formData.append("difficulty", difficulty);

        const response = await api.post(
          "/api/v1/interview/resume-based",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return {
          aiResponse:
            response.data?.data?.firstQuestion ||
            "Hello! Let's start the interview.",
          sessionId: response.data?.data?.sessionId,
          userMessage: "Hello, I am ready to start the interview.",
          isFirstMessage: true,
        };
      } else {
        // Continue existing interview session
        const response = await api.patch(
          `/api/v1/interview/resume-based/${sessionId}`,
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
      state.showAchievementAnimation = null;
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

    // AI Interview management
    startInterview: (state) => {
      state.interviewStarted = true;
      state.conversation = [];
      state.currentSessionId = null;
      state.aiResponseError = null;
    },

    addUserMessage: (state, action) => {
      state.conversation.push({
        type: "user",
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
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

        const { aiResponse, sessionId, userMessage, isFirstMessage } =
          action.payload;

        // Set session ID if this is the first response
        if (sessionId && !state.currentSessionId) {
          state.currentSessionId = sessionId;
        }

        // For first message, only add AI response (user message is generic)
        if (isFirstMessage) {
          state.conversation.push({
            type: "ai",
            message: aiResponse,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Add user message to conversation
          state.conversation.push({
            type: "user",
            message: userMessage,
            timestamp: new Date().toISOString(),
          });

          // Add AI response to conversation
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
  startInterview,
  addUserMessage,
  addAIMessage,
  setCurrentSessionId,
  resetInterview,
  clearAiResponseError,
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

export default interviewSlice.reducer;
