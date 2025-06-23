import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunk for fetching all daily questions grouped by subject
export const fetchDailyQuestions = createAsyncThunk(
  "dq/fetchDailyQuestions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/dq/daily-questions");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch daily questions"
      );
    }
  }
);

// Async thunk for fetching available subjects
export const fetchSubjects = createAsyncThunk(
  "dq/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/dq/subjects");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects"
      );
    }
  }
);

// Async thunk for fetching questions for a specific subject
export const fetchQuestionsBySubject = createAsyncThunk(
  "dq/fetchQuestionsBySubject",
  async (subject, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/dq/subject/${subject}`);
      return {
        subject,
        questions: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          `Failed to fetch questions for ${subject}`
      );
    }
  }
); // Async thunk for submitting quiz answers
export const submitQuizAnswers = createAsyncThunk(
  "dq/submitQuizAnswers",
  async ({ answers, subject, questions }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/dq/submit-answers", {
        answers,
        subject,
      });

      // Verify that the response contains the necessary data
      if (!response.data || response.data.success === false) {
        return rejectWithValue(
          response.data?.message || "Failed to process quiz answers"
        );
      }

      // Return a complete result object
      return {
        ...response.data,
        success: true,
        subject,
        answers,
        questions,
        totalQuestions: questions.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Quiz submission error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit quiz answers"
      );
    }
  }
);

// Initial state
const initialState = {
  // Daily questions data
  dailyQuestions: {},
  dailyQuestionsLoading: false,
  dailyQuestionsError: null,

  // Available subjects
  subjects: [],
  subjectsLoading: false,
  subjectsError: null,

  // Subject-specific questions
  subjectQuestions: [],
  currentSubject: null,
  subjectQuestionsLoading: false,
  subjectQuestionsError: null,

  // Quiz state
  currentQuiz: {
    questions: [],
    currentIndex: 0,
    answers: [],
    subject: null,
    isActive: false,
  },

  // Quiz results
  quizResults: null,
  submissionLoading: false,
  submissionError: null,

  // Quiz history
  completedQuizzes: [],
};

// Create the slice
const dqSlice = createSlice({
  name: "dq",
  initialState,
  reducers: {
    // Quiz management actions
    startQuiz: (state, action) => {
      const { questions, subject } = action.payload;
      state.currentQuiz = {
        questions: questions.map((q) => ({
          ...q,
          options: [q.option1, q.option2, q.option3, q.option4],
        })),
        currentIndex: 0,
        answers: [],
        subject,
        isActive: true,
      };
      state.quizResults = null;
      state.submissionError = null;
    },

    nextQuestion: (state) => {
      if (
        state.currentQuiz.currentIndex <
        state.currentQuiz.questions.length - 1
      ) {
        state.currentQuiz.currentIndex += 1;
      }
    },

    previousQuestion: (state) => {
      if (state.currentQuiz.currentIndex > 0) {
        state.currentQuiz.currentIndex -= 1;
      }
    },

    setCurrentQuestionIndex: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.currentQuiz.questions.length) {
        state.currentQuiz.currentIndex = index;
      }
    },
    selectAnswer: (state, action) => {
      const { questionIndex, selectedOption } = action.payload;
      const question = state.currentQuiz.questions[questionIndex];

      if (question) {
        // Remove existing answer for this question if it exists
        state.currentQuiz.answers = state.currentQuiz.answers.filter(
          (answer) => answer.questionId !== question._id
        );

        // Add new answer
        state.currentQuiz.answers.push({
          questionId: question._id,
          selectedOption,
          questionIndex,
        });
      }
    },

    finishQuiz: (state) => {
      state.currentQuiz.isActive = false;
    },

    resetQuiz: (state) => {
      state.currentQuiz = {
        questions: [],
        currentIndex: 0,
        answers: [],
        subject: null,
        isActive: false,
      };
      state.quizResults = null;
      state.submissionError = null;
    }, // Clear errors
    clearDailyQuestionsError: (state) => {
      state.dailyQuestionsError = null;
    },

    clearSubjectsError: (state) => {
      state.subjectsError = null;
    },

    clearSubjectQuestionsError: (state) => {
      state.subjectQuestionsError = null;
    },

    clearSubmissionError: (state) => {
      state.submissionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch daily questions
      .addCase(fetchDailyQuestions.pending, (state) => {
        state.dailyQuestionsLoading = true;
        state.dailyQuestionsError = null;
      })
      .addCase(fetchDailyQuestions.fulfilled, (state, action) => {
        state.dailyQuestionsLoading = false;
        state.dailyQuestions = action.payload;
        state.dailyQuestionsError = null;
      })
      .addCase(fetchDailyQuestions.rejected, (state, action) => {
        state.dailyQuestionsLoading = false;
        state.dailyQuestionsError = action.payload;
      })

      // Fetch subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.subjectsLoading = true;
        state.subjectsError = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjectsLoading = false;
        state.subjects = action.payload;
        state.subjectsError = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.subjectsLoading = false;
        state.subjectsError = action.payload;
      })

      // Fetch questions by subject
      .addCase(fetchQuestionsBySubject.pending, (state) => {
        state.subjectQuestionsLoading = true;
        state.subjectQuestionsError = null;
      })      .addCase(fetchQuestionsBySubject.fulfilled, (state, action) => {
        state.subjectQuestionsLoading = false;
        // Ensure exactly 10 questions
        state.subjectQuestions = action.payload.questions.slice(0, 10);
        state.currentSubject = action.payload.subject;
        state.subjectQuestionsError = null;
      })
      .addCase(fetchQuestionsBySubject.rejected, (state, action) => {
        state.subjectQuestionsLoading = false;
        state.subjectQuestionsError = action.payload;
      }) // Submit quiz answers
      .addCase(submitQuizAnswers.pending, (state) => {
        state.submissionLoading = true;
        state.submissionError = null;
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.submissionLoading = false;

        // Check if we received valid results from the API
        if (action.payload && action.payload.success !== false) {
          state.quizResults = action.payload;
          state.submissionError = null;

          // Add to completed quizzes
          state.completedQuizzes.push({
            ...action.payload,
            completedAt: new Date().toISOString(),
          });
        } else {
          // Handle the case where the API returned an error response but the request itself succeeded
          state.submissionError =
            action.payload?.message || "Failed to process quiz results";
        }

        // Finish the current quiz
        state.currentQuiz.isActive = false;
      })
      .addCase(submitQuizAnswers.rejected, (state, action) => {
        state.submissionLoading = false;
        state.submissionError =
          action.payload || "Failed to submit quiz answers";
        console.error("Quiz submission rejected:", action.payload);
      });
  },
});

// Export actions
export const {
  startQuiz,
  nextQuestion,
  previousQuestion,
  setCurrentQuestionIndex,
  selectAnswer,
  finishQuiz,
  resetQuiz,
  clearDailyQuestionsError,
  clearSubjectsError,
  clearSubjectQuestionsError,
  clearSubmissionError,
} = dqSlice.actions;

// Selectors
export const selectDailyQuestions = (state) => state.dq.dailyQuestions;
export const selectDailyQuestionsLoading = (state) =>
  state.dq.dailyQuestionsLoading;
export const selectDailyQuestionsError = (state) =>
  state.dq.dailyQuestionsError;

export const selectSubjects = (state) => state.dq.subjects;
export const selectSubjectsLoading = (state) => state.dq.subjectsLoading;
export const selectSubjectsError = (state) => state.dq.subjectsError;

export const selectSubjectQuestions = (state) => state.dq.subjectQuestions;
export const selectCurrentSubject = (state) => state.dq.currentSubject;
export const selectSubjectQuestionsLoading = (state) =>
  state.dq.subjectQuestionsLoading;
export const selectSubjectQuestionsError = (state) =>
  state.dq.subjectQuestionsError;

export const selectCurrentQuiz = (state) => state.dq.currentQuiz;
export const selectCurrentQuestion = (state) => {
  const quiz = state.dq.currentQuiz;
  return quiz.questions[quiz.currentIndex] || null;
};
export const selectQuizProgress = createSelector(
  [(state) => state.dq.currentQuiz],
  (quiz) => ({
    current: quiz.currentIndex + 1,
    total: quiz.questions.length,
    percentage:
      quiz.questions.length > 0
        ? ((quiz.currentIndex + 1) / quiz.questions.length) * 100
        : 0,
  })
);
export const selectUserAnswer = (state, questionIndex) => {
  const quiz = state.dq.currentQuiz;
  const question = quiz.questions[questionIndex];
  if (!question) return null;

  const answer = quiz.answers.find((a) => a.questionId === question._id);
  return answer ? answer.selectedOption : null;
};

export const selectQuizResults = (state) => state.dq.quizResults;
export const selectSubmissionLoading = (state) => state.dq.submissionLoading;
export const selectSubmissionError = (state) => state.dq.submissionError;
export const selectQuizState = (state) => state.dq.currentQuiz;

export const selectCompletedQuizzes = (state) => state.dq.completedQuizzes;

// Export reducer
export default dqSlice.reducer;
