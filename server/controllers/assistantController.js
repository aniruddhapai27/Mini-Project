const pythonAPI = require("../utils/pythonAPI");
const { catchAsync } = require("../utils/catchAsync");
const Assistant = require("../models/assistantModel");

// Get assistant sessions with enhanced pagination
exports.getAssistantSessionHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  let { page = 1, limit = 10 } = req.query;

  // Convert to integers and validate
  page = parseInt(page);
  limit = parseInt(limit);

  // Validate pagination parameters
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: "Page number must be greater than 0",
    });
  }

  // Set maximum limit to prevent abuse and ensure good performance
  const MAX_LIMIT = 50;
  const DEFAULT_LIMIT = 10;

  if (limit < 1) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  try {
    // Use Promise.all for better performance
    const [sessions, total] = await Promise.all([
      Assistant.find({ user: userId })
        .sort({ createdAt: -1, updatedAt: -1, _id: -1 }) // Multiple sort criteria for consistent ordering
        .limit(limit)
        .skip(skip)
        .select("subject QnA createdAt updatedAt")
        .lean(), // Use lean() for better performance
      Assistant.countDocuments({ user: userId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Validate if requested page exists
    if (page > totalPages && total > 0) {
      return res.status(400).json({
        success: false,
        message: `Page ${page} does not exist. Total pages: ${totalPages}`,
      });
    }

    // Process sessions to add summary information
    const processedSessions = sessions.map((session) => ({
      ...session,
      messageCount: session.QnA ? session.QnA.length : 0,
      lastMessage:
        session.QnA && session.QnA.length > 0
          ? session.QnA[session.QnA.length - 1].user.substring(0, 100) + "..."
          : "No messages yet",
      lastActivity: session.updatedAt || session.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        sessions: processedSessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions: total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        // Backward compatibility
        totalPages,
        currentPage: page,
        totalSessions: total,
      },
    });
  } catch (error) {
    console.error("Error fetching assistant session history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assistant session history",
      error: error.message,
    });
  }
});

// Get recent assistant sessions
exports.getRecentAssistantSessions = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { limit = 5 } = req.query;

  try {
    const sessions = await Assistant.find({ user: userId })
      .sort({ createdAt: -1, updatedAt: -1, _id: -1 }) // Multiple sort criteria for consistent ordering
      .limit(parseInt(limit))
      .select("subject QnA createdAt updatedAt")
      .lean();

    // Process sessions to add summary information
    const processedSessions = sessions.map((session) => ({
      ...session,
      messageCount: session.QnA ? session.QnA.length : 0,
      lastMessage:
        session.QnA && session.QnA.length > 0
          ? session.QnA[session.QnA.length - 1].user.substring(0, 100) + "..."
          : "No messages yet",
      lastActivity: session.updatedAt || session.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: { sessions: processedSessions },
    });
  } catch (error) {
    console.error("Error fetching recent assistant sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent assistant sessions",
      error: error.message,
    });
  }
});

// Get assistant session by ID
exports.getAssistantSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  try {
    const session = await Assistant.findOne({
      _id: sessionId,
      user: userId,
    }).populate("user", "name email");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Assistant session not found",
      });
    }

    // Add consistent structure like paginated history
    const sessionData = {
      ...session.toObject(),
      messageCount: session.QnA ? session.QnA.length : 0,
      lastActivity: session.updatedAt || session.createdAt,
    };

    res.status(200).json({
      success: true,
      data: sessionData,
      // For backwards compatibility, also return in the old format
      session: sessionData,
      messages: session.QnA || [],
    });
  } catch (error) {
    console.error("Error fetching assistant session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assistant session",
      error: error.message,
    });
  }
});

// Delete assistant session
exports.deleteAssistantSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  try {
    const session = await Assistant.findOneAndDelete({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Assistant session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assistant session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assistant session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete assistant session",
      error: error.message,
    });
  }
});

// Get assistant statistics for the user
exports.getAssistantStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  try {
    const stats = await Assistant.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: { $size: "$QnA" } },
          averageMessagesPerSession: { $avg: { $size: "$QnA" } },
          subjectBreakdown: {
            $push: {
              subject: "$subject",
              messageCount: { $size: "$QnA" },
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalMessages: 0,
      averageMessagesPerSession: 0,
      subjectBreakdown: [],
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching assistant stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assistant statistics",
      error: error.message,
    });
  }
});

exports.chatWithAssistant = catchAsync(async (req, res) => {
  try {
    // Extract user from request (added by isLogin middleware)
    const userId = req.user._id.toString();

    console.log("Making request to Python API:", {
      url: "/api/v1/assistant/chat",
      body: { ...req.body, user_id: userId },
      userId,
    });

    // Forward the request to Python API with user ID
    const response = await pythonAPI.post(
      "/api/v1/assistant/chat",
      {
        ...req.body,
        user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`,
          "x-user-id": userId,
        },
      }
    );

    console.log("Python API response:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in chatWithAssistant:", error.message);
    if (error.response) {
      console.error("Python API error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    res.status(500).json({
      error: "Error communicating with Python API",
      details: error.message,
    });
  }
});

exports.getSessionHistory = catchAsync(async (req, res) => {
  try {
    // Extract user from request
    const userId = req.user._id.toString();

    console.log("Getting chat history:", {
      url: "/api/v1/assistant/history",
      userId,
    });

    // Get chat history from Python API
    const response = await pythonAPI.get("/api/v1/assistant/history", {
      headers: {
        Authorization: `Bearer ${req.cookies.jwt}`,
        "x-user-id": userId,
      },
    });

    console.log("Python API response:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getSessionHistory:", error.message);
    if (error.response) {
      console.error("Python API error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    res
      .status(500)
      .json({ error: "Error getting session history", details: error.message });
  }
});

exports.getSessionMessages = catchAsync(async (req, res) => {
  try {
    // Extract session ID from request
    const { sessionId } = req.params;
    const userId = req.user._id.toString();

    console.log("Getting session messages:", {
      url: `/api/v1/assistant/session/${sessionId}`,
      sessionId,
      userId,
    });

    // Get session messages from Python API
    const response = await pythonAPI.get(
      `/api/v1/assistant/session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`,
          "x-user-id": userId,
        },
      }
    );

    console.log("Python API response:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getSessionMessages:", error.message);
    if (error.response) {
      console.error("Python API error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    res.status(500).json({
      error: "Error getting session messages",
      details: error.message,
    });
  }
});

exports.deleteSession = catchAsync(async (req, res) => {
  try {
    // Extract session ID from request
    const { sessionId } = req.params;
    const userId = req.user._id.toString();

    console.log("Deleting session:", {
      url: `/api/v1/assistant/session/${sessionId}`,
      sessionId,
      userId,
    });

    // Delete session from Python API
    const response = await pythonAPI.delete(
      `/api/v1/assistant/session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`,
          "x-user-id": userId,
        },
      }
    );

    console.log("Python API response:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in deleteSession:", error.message);
    if (error.response) {
      console.error("Python API error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    res
      .status(500)
      .json({ error: "Error deleting session", details: error.message });
  }
});

exports.analyzeResume = catchAsync(async (req, res) => {
  try {
    // Extract user from request (added by isLogin middleware)
    const userId = req.user._id.toString();

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Analyzing resume with Python API:", {
      url: "/api/v1/assistant/resume",
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    // Create FormData to forward the file to Python API
    const FormData = require("form-data");
    const formData = new FormData();

    // Add the file buffer and metadata to FormData
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Forward the request to Python API with user authentication
    const response = await pythonAPI.post(
      "/api/v1/assistant/resume",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${req.cookies.jwt}`,
          "x-user-id": userId,
        },
        timeout: 60000, // 60 second timeout for AI analysis
      }
    );

    console.log("Python API response:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in analyzeResume:", error.message);
    if (error.response) {
      console.error("Python API error:", {
        status: error.response.status,
        data: error.response.data,
      });
      return res.status(error.response.status).json(error.response.data);
    }
    res
      .status(500)
      .json({ error: "Error analyzing resume", details: error.message });
  }
});
