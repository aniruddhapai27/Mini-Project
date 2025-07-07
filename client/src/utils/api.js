import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 30000, // 30-second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Resume API functions
export const resumeApi = {
  // Upload resume
  upload: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/api/v1/user/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get current resume
  get: async () => {
    const response = await api.get("/api/v1/user/resume");
    return response.data;
  },

  // Delete resume
  delete: async () => {
    const response = await api.delete("/api/v1/user/resume");
    return response.data;
  },
};

// Interview API functions
export const interviewApi = {
  // Create new interview session (resume-based)
  create: async (domain, difficulty) => {
    const response = await api.post("/api/v1/interview/sessions", {
      domain,
      difficulty,
    });
    return response.data;
  },

  // Continue interview session
  continue: async (sessionId, userResponse) => {
    const response = await api.patch(
      `/api/v1/interview/sessions/${sessionId}`,
      {
        userResponse,
      }
    );
    return response.data;
  },

  // End interview session
  end: async (sessionId) => {
    const response = await api.patch(
      `/api/v1/interview/sessions/${sessionId}/end`
    );
    return response.data;
  },

  // Get interview history
  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/api/v1/interview/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get interview statistics
  getStats: async () => {
    const response = await api.get("/api/v1/interview/stats");
    return response.data;
  },

  // Get recent interviews
  getRecent: async (limit = 5) => {
    const response = await api.get(`/api/v1/interview/recent?limit=${limit}`);
    return response.data;
  },

  // Get interview feedback
  getFeedback: async (sessionId) => {
    const response = await api.get(
      `/api/v1/interview/sessions/${sessionId}/feedback`
    );
    return response.data;
  },
};

// Study Assistant API functions
export const studyAssistantApi = {
  // Send message to study assistant (creates session if none provided)
  sendMessage: async (messageData) => {
    try {
      console.log("Sending message:", messageData);
      const response = await api.post("/api/v1/assistant/chat", messageData);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Get chat history/sessions
  getHistory: async () => {
    try {
      console.log("Getting history");
      const response = await api.get("/api/v1/assistant/history");
      return response.data;
    } catch (error) {
      console.error("Error getting history:", error);
      throw error;
    }
  },

  // Get paginated session history
  getPaginatedHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/api/v1/assistant/paginated-history", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting paginated history:", error);
      throw error;
    }
  },

  // Get recent sessions
  getRecentSessions: async (limit = 5) => {
    try {
      console.log("Getting recent sessions:", { limit });
      const response = await api.get("/api/v1/assistant/recent-sessions", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting recent sessions:", error);
      throw error;
    }
  },

  // Get assistant stats
  getStats: async () => {
    try {
      console.log("Getting assistant stats");
      const response = await api.get("/api/v1/assistant/stats");
      return response.data;
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  },
  // Get specific session messages
  getSession: async (sessionId) => {
    try {
      console.log("Getting session:", sessionId);
      const response = await api.get(`/api/v1/assistant/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  },

  // Delete a session
  deleteSession: async (sessionId) => {
    try {
      console.log("Deleting session:", sessionId);
      const response = await api.delete(
        `/api/v1/assistant/session/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  },
};

export default api;
