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
};

export default dqAPI;
