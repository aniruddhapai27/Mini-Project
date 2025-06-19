const pythonAPI = require('../utils/pythonAPI');
const { catchAsync } = require('../utils/catchAsync');

exports.chatWithAssistant = catchAsync(async (req, res) => {
  // Extract user from request (added by isLogin middleware)
  const userId = req.user._id.toString();
  
  // Forward the request to Python API with user ID
  const response = await pythonAPI.post('/assistant/chat', {
    ...req.body,
    user_id: userId
  }, {
    headers: {
      'Authorization': `Bearer ${req.cookies.jwt}`,
      'x-user-id': userId
    }
  });
  
  res.status(200).json(response.data);
});

exports.getSessionHistory = catchAsync(async (req, res) => {
  // Extract user from request
  const userId = req.user._id.toString();
  
  // Get chat history from Python API
  const response = await pythonAPI.get('/assistant/history', {
    headers: {
      'Authorization': `Bearer ${req.cookies.jwt}`,
      'x-user-id': userId
    }
  });
  
  res.status(200).json(response.data);
});

exports.getSessionMessages = catchAsync(async (req, res) => {
  // Extract session ID from request
  const { sessionId } = req.params;
  const userId = req.user._id.toString();
  
  // Get session messages from Python API
  const response = await pythonAPI.get(`/assistant/session/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${req.cookies.jwt}`,
      'x-user-id': userId
    }
  });
  
  res.status(200).json(response.data);
});
