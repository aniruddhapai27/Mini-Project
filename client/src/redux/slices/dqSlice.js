import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
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
);

// Async thunk for submitting quiz answers
export const submitQuizAnswers = createAsyncThunk(
  "dq/submitQuizAnswers",
  async ({ answers, subject, questions }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/dq/submit-answers", {
        answers,
        subject,
      });
      return {
        ...response.data,
        subject,
        answers,
        questions,
      };
    } catch (error) {
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
    },

    // Clear errors
    clearDailyQuestionsError: (state) => {
      state.dailyQuestionsError = null;
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

      // Fetch questions by subject
      .addCase(fetchQuestionsBySubject.pending, (state) => {
        state.subjectQuestionsLoading = true;
        state.subjectQuestionsError = null;
      })
      .addCase(fetchQuestionsBySubject.fulfilled, (state, action) => {
        state.subjectQuestionsLoading = false;
        state.subjectQuestions = action.payload.questions;
        state.currentSubject = action.payload.subject;
        state.subjectQuestionsError = null;
      })
      .addCase(fetchQuestionsBySubject.rejected, (state, action) => {
        state.subjectQuestionsLoading = false;
        state.subjectQuestionsError = action.payload;
      })

      // Submit quiz answers
      .addCase(submitQuizAnswers.pending, (state) => {
        state.submissionLoading = true;
        state.submissionError = null;
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.submissionLoading = false;
        state.quizResults = action.payload;
        state.submissionError = null;

        // Add to completed quizzes
        state.completedQuizzes.push({
          ...action.payload,
          completedAt: new Date().toISOString(),
        });

        // Finish the current quiz
        state.currentQuiz.isActive = false;
      })
      .addCase(submitQuizAnswers.rejected, (state, action) => {
        state.submissionLoading = false;
        state.submissionError = action.payload;
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
  clearSubjectQuestionsError,
  clearSubmissionError,
} = dqSlice.actions;

// Selectors
export const selectDailyQuestions = (state) => state.dq.dailyQuestions;
export const selectDailyQuestionsLoading = (state) =>
  state.dq.dailyQuestionsLoading;
export const selectDailyQuestionsError = (state) =>
  state.dq.dailyQuestionsError;

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
export const selectQuizProgress = (state) => {
  const quiz = state.dq.currentQuiz;
  return {
    current: quiz.currentIndex + 1,
    total: quiz.questions.length,
    percentage:
      quiz.questions.length > 0
        ? ((quiz.currentIndex + 1) / quiz.questions.length) * 100
        : 0,
  };
};
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
