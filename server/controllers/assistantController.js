const pythonAPI = require('../utils/pythonAPI');
const { catchAsync } = require('../utils/catchAsync');

exports.chatWithAssistant = catchAsync(async (req, res) => {
  try {
    // Extract user from request (added by isLogin middleware)
    const userId = req.user._id.toString();
    
    console.log('Making request to Python API:', {
      url: '/api/v1/assistant/chat',
      body: { ...req.body, user_id: userId },
      userId
    });
    
    // Forward the request to Python API with user ID
    const response = await pythonAPI.post('/api/v1/assistant/chat', {
      ...req.body,
      user_id: userId
    }, {
      headers: {
        'Authorization': `Bearer ${req.cookies.jwt}`,
        'x-user-id': userId
      }
    });
    
    console.log('Python API response:', response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in chatWithAssistant:', error.message);
    if (error.response) {
      console.error('Python API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }    res.status(500).json({ error: 'Error communicating with Python API', details: error.message });
  }
});

exports.getSessionHistory = catchAsync(async (req, res) => {
  try {
    // Extract user from request
    const userId = req.user._id.toString();
    
    console.log('Getting chat history:', {
      url: '/api/v1/assistant/history',
      userId
    });
    
    // Get chat history from Python API
    const response = await pythonAPI.get('/api/v1/assistant/history', {
      headers: {
        'Authorization': `Bearer ${req.cookies.jwt}`,
        'x-user-id': userId
      }
    });
    
    console.log('Python API response:', response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in getSessionHistory:', error.message);
    if (error.response) {
      console.error('Python API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ error: 'Error getting session history', details: error.message });
  }
});

exports.getSessionMessages = catchAsync(async (req, res) => {
  try {
    // Extract session ID from request
    const { sessionId } = req.params;
    const userId = req.user._id.toString();
    
    console.log('Getting session messages:', {
      url: `/api/v1/assistant/session/${sessionId}`,
      sessionId,
      userId
    });
    
    // Get session messages from Python API
    const response = await pythonAPI.get(`/api/v1/assistant/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${req.cookies.jwt}`,
        'x-user-id': userId
      }
    });
    
    console.log('Python API response:', response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in getSessionMessages:', error.message);
    if (error.response) {
      console.error('Python API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }    res.status(500).json({ error: 'Error getting session messages', details: error.message });
  }
});

exports.deleteSession = catchAsync(async (req, res) => {
  try {
    // Extract session ID from request
    const { sessionId } = req.params;
    const userId = req.user._id.toString();
    
    console.log('Deleting session:', {
      url: `/api/v1/assistant/session/${sessionId}`,
      sessionId,
      userId
    });
    
    // Delete session from Python API
    const response = await pythonAPI.delete(`/api/v1/assistant/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${req.cookies.jwt}`,
        'x-user-id': userId
      }
    });
    
    console.log('Python API response:', response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in deleteSession:', error.message);
    if (error.response) {
      console.error('Python API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ error: 'Error deleting session', details: error.message });
  }
});

exports.analyzeResume = catchAsync(async (req, res) => {
  try {
    // Extract user from request (added by isLogin middleware)
    const userId = req.user._id.toString();
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('Analyzing resume with Python API:', {
      url: '/api/v1/assistant/resume',
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Create FormData to forward the file to Python API
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add the file buffer and metadata to FormData
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward the request to Python API with user authentication
    const response = await pythonAPI.post('/api/v1/assistant/resume', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${req.cookies.jwt}`,
        'x-user-id': userId
      },
      timeout: 60000 // 60 second timeout for AI analysis
    });
    
    console.log('Python API response:', response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in analyzeResume:', error.message);
    if (error.response) {
      console.error('Python API error:', {
        status: error.response.status,
        data: error.response.data
      });
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Error analyzing resume', details: error.message });
  }
});
