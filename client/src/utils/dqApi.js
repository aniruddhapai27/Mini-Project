import api from "./api";

// Daily Questions API
export const dqAPI = {
  // Get all daily questions
  getDailyQuestions: async () => {
    try {
      const response = await api.get("/api/v1/dq/daily-questions");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch daily questions";
    }
  },

  // Get questions by subject
  getQuestionsBySubject: async (subject) => {
    try {
      const response = await api.get(`/api/v1/dq/subject/${subject}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        `Failed to fetch questions for ${subject}`
      );
    }
  },

  // Submit quiz answers
  submitQuizAnswers: async (answers, subject) => {
    try {
      const response = await api.post("/api/v1/dq/submit-answers", {
        answers,
        subject,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to submit quiz answers";
    }
  },

  // Get user quiz history
  getUserQuizHistory: async (page = 1, limit = 50, subject = null) => {
    try {
      const params = { page, limit };
      if (subject) params.subject = subject;
      
      const response = await api.get("/api/v1/dq/history", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch quiz history";
    }
  },

  // Get quiz statistics for graphs
  getQuizStats: async (timeframe = '30d', subject = null) => {
    try {
      const params = { timeframe };
      if (subject) params.subject = subject;
      
      const response = await api.get("/api/v1/dq/stats", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch quiz statistics";
    }
  },

  // Get daily activity data
  getDailyActivityData: async (year) => {
    try {
      const response = await api.get(`/api/v1/dq/daily-activity?year=${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch daily activity data";
    }
  },
};

export default dqAPI;
