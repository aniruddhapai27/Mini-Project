import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
});

// Resume API functions
export const resumeApi = {  // Upload resume
  upload: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/api/v1/user/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get current resume
  get: async () => {
    const response = await api.get('/api/v1/user/resume');
    return response.data;
  },

  // Delete resume
  delete: async () => {
    const response = await api.delete('/api/v1/user/resume');
    return response.data;
  },
};

// Interview API functions  
export const interviewApi = {
  // Create new interview session (resume-based)
  create: async (domain, difficulty) => {
    const response = await api.post('/api/v1/interview/sessions', {
      domain,
      difficulty,
    });
    return response.data;
  },

  // Continue interview session
  continue: async (sessionId, userResponse) => {
    const response = await api.patch(`/api/v1/interview/sessions/${sessionId}`, {
      userResponse,
    });
    return response.data;
  },

  // End interview session
  end: async (sessionId) => {
    const response = await api.patch(`/api/v1/interview/sessions/${sessionId}/end`);
    return response.data;
  },

  // Get interview history
  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/api/v1/interview/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get interview statistics
  getStats: async () => {
    const response = await api.get('/api/v1/interview/stats');
    return response.data;
  },

  // Get recent interviews
  getRecent: async (limit = 5) => {
    const response = await api.get(`/api/v1/interview/recent?limit=${limit}`);
    return response.data;
  },
};

// Study Assistant API functions
export const studyAssistantApi = {
  // Create new study session
  createSession: async (subject) => {
    const response = await api.post('/api/v1/assistant/chat', {
      user_query: "Hello, I'd like to start studying this subject.",
      subject: subject,
      session_id: null
    });
    return response.data;
  },

  // Send message to study assistant
  sendMessage: async (messageData) => {
    const response = await api.post('/api/v1/assistant/chat', messageData);
    return response.data;
  },

  // Get chat history/sessions
  getHistory: async () => {
    const response = await api.get('/api/v1/assistant/history');
    return response.data;
  },

  // Get specific session messages
  getSession: async (sessionId) => {
    const response = await api.get(`/api/v1/assistant/session/${sessionId}`);
    return response.data;
  }
};

export default api;
