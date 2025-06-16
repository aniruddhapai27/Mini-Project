/**
 * Resume-Based Interview Controller
 *
 * This controller handles resume-based interview operations including:
 * - Creating new resume-based interview sessions with file upload
 * - Managing Q&A flow during interviews based on resume content
 * - Storing conversation history with personalized context
 * - Providing feedback and scoring
 * - Generating user statistics
 *
 * All endpoints require user authentication and resume upload
 */

const Interview = require("../models/interviewModel");
const User = require("../models/userModel");
const { catchAsync } = require("../utils/catchAsync");
const axios = require("axios");

// Get interview session by ID
exports.getInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({
    _id: sessionId,
    user: userId,
  }).populate("user", "name email");

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  res.status(200).json({
    success: true,
    data: interview,
  });
});

// End interview session and calculate final score
exports.endInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  // Calculate final score based on number of questions completed
  const questionCount = interview.QnA.length;
  let score = Math.min(100, 50 + questionCount * 10); // Base 50, +10 per question

  // Add difficulty bonus
  const difficultyBonus = { easy: 0, medium: 5, hard: 10 };
  score += difficultyBonus[interview.difficulty] || 0;

  interview.score = score;
  await interview.save();

  res.status(200).json({
    success: true,
    message: "Interview session ended successfully",
    data: {
      sessionId: interview._id,
      finalScore: score,
      questionsCompleted: questionCount,
      domain: interview.domain,
      difficulty: interview.difficulty,
    },
  });
});

// Get interview conversation history
exports.getInterviewConversation = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({
    _id: sessionId,
    user: userId,
  }).select("QnA domain difficulty createdAt");

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      conversation: interview.QnA,
      domain: interview.domain,
      difficulty: interview.difficulty,
      createdAt: interview.createdAt,
    },
  });
});

// Delete interview session
exports.deleteInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOneAndDelete({
    _id: sessionId,
    user: userId,
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Interview session deleted successfully",
  });
});

// Update interview feedback
exports.updateInterviewFeedback = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { feedBack } = req.body;
  const userId = req.user._id;

  if (!feedBack) {
    return res.status(400).json({
      success: false,
      message: "Feedback is required",
    });
  }

  const interview = await Interview.findOneAndUpdate(
    { _id: sessionId, user: userId },
    { feedBack },
    { new: true }
  );

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Interview feedback updated successfully",
    data: interview,
  });
});

// Get interview statistics for the user
exports.getInterviewStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const stats = await Interview.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        averageScore: { $avg: "$score" },
        totalQuestions: { $sum: { $size: "$QnA" } },
        domainBreakdown: {
          $push: {
            domain: "$domain",
            difficulty: "$difficulty",
            score: "$score",
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalInterviews: 0,
    averageScore: 0,
    totalQuestions: 0,
    domainBreakdown: [],
  };

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Get user's interview history
exports.getUserInterviewHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const interviews = await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("domain difficulty score QnA createdAt feedBack");

  const total = await Interview.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    data: {
      interviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalInterviews: total,
    },
  });
});

// Get recent interviews
exports.getRecentInterviews = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { limit = 5 } = req.query;

  const interviews = await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select("domain difficulty score createdAt");

  res.status(200).json({
    success: true,
    data: { interviews },
  });
});

// Resume-based interview controller - Updated to use user's stored resume
exports.createResumeBasedInterview = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { domain, difficulty } = req.body;

  if (!domain || !difficulty) {
    return res.status(400).json({
      success: false,
      message: "Domain and difficulty level are required",
    });
  }

  if (!["hr", "dataScience", "webdev", "fullTechnical"].includes(domain)) {
    return res.status(400).json({
      success: false,
      message: "Domain must be hr, dataScience, webdev, or fullTechnical",
    });
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).json({
      success: false,
      message: "Difficulty must be easy, medium, or hard",
    });
  }

  try {
    // Get user's stored resume
    const user = await User.findById(userId).select('resume');
    let resumeBuffer = null;
    let resumeFilename = "no_resume.txt";
    
    if (user && user.resume) {
      try {
        // Download resume from Cloudinary
        const response = await axios.get(user.resume, { 
          responseType: 'arraybuffer',
          timeout: 10000 // 10 second timeout
        });
        resumeBuffer = Buffer.from(response.data);
        resumeFilename = user.resume.split('/').pop() || "resume.pdf";
      } catch (downloadError) {
        console.log("Failed to download user's resume, using default:", downloadError.message);
      }
    }

    let aiResponse, pythonSessionId;

    try {
      const pythonAPI = require("../utils/pythonAPI");
      const FormData = require("form-data");
      
      // Create FormData to send to Python service
      const formData = new FormData();

      if (resumeBuffer) {
        formData.append("file", resumeBuffer, {
          filename: resumeFilename,
          contentType: resumeFilename.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
        });
      } else {
        // Create a default message if no resume is available
        const defaultBuffer = Buffer.from(
          "No resume provided. Please conduct a general interview based on the selected domain and difficulty level.",
          "utf8"
        );
        formData.append("file", defaultBuffer, {
          filename: "default_message.txt",
          contentType: "text/plain",
        });
      }

      formData.append("domain", domain);
      formData.append("difficulty", difficulty);
      formData.append(
        "user_response",
        "Hello, I am ready to start the interview."
      );

      // Add auth cookie
      const token = req.cookies.jwt;

      // Call Python service
      const response = await pythonAPI.post(
        "/api/v1/interview/resume-based",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Cookie: `jwt=${token}`,
          },
          timeout: 30000 // 30 second timeout
        }
      );

      aiResponse = response.data.ai;
      pythonSessionId = response.data.session_id;
    } catch (pythonError) {
      console.log(
        "Python service unavailable, using fallback:",
        pythonError.message
      );

      // Fallback response when Python service is unavailable
      const domainQuestions = {
        hr: "Hello! I'm excited to conduct this HR interview with you. Let's start by telling me about yourself and what interests you about this role?",
        dataScience:
          "Welcome to your data science interview! I'd like to begin by understanding your background. Can you tell me about your experience with data analysis and machine learning?",
        webdev:
          "Great to meet you! For this web development interview, let's start with your experience. Can you walk me through your journey as a web developer and your favorite technologies?",
        fullTechnical:
          "Welcome to your technical interview! I'll be asking you questions across multiple technical domains. Let's begin - can you introduce yourself and your technical background?",
      };

      aiResponse =
        domainQuestions[domain] ||
        "Hello! Welcome to your interview. Please tell me about yourself and your background.";
      pythonSessionId = `fallback_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    // Create interview session in MongoDB
    const newInterview = new Interview({
      user: userId,
      domain: domain,
      difficulty: difficulty,
      QnA: [
        {
          bot: aiResponse,
          user: "Hello, I am ready to start the interview.",
          createdAt: new Date(),
        },
      ],
      sessionId: pythonSessionId,
      resumeUsed: user?.resume || null, // Store which resume was used
    });

    await newInterview.save();

    res.status(201).json({
      success: true,
      message: "Resume-based interview session created successfully",
      data: {
        sessionId: newInterview._id,
        pythonSessionId: pythonSessionId,
        domain: domain,
        difficulty: difficulty,
        firstQuestion: aiResponse,
        createdAt: newInterview.createdAt,
        resumeUsed: !!user?.resume, // Boolean indicating if resume was used
      },
    });
  } catch (error) {
    console.error("Error creating resume-based interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create resume-based interview session",
      error: error.message,
    });
  }
});


// Continue resume-based interview
exports.continueResumeBasedInterview = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { userResponse } = req.body;
  const userId = req.user._id;

  if (!userResponse || !userResponse.trim()) {
    return res.status(400).json({
      success: false,
      message: "User response is required",
    });
  }

  // Find the interview session
  const interview = await Interview.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  if (!interview.sessionId) {
    return res.status(400).json({
      success: false,
      message: "Invalid interview session - missing Python session ID",
    });
  }
  try {
    let aiResponse;

    try {
      const pythonAPI = require("../utils/pythonAPI");
      const FormData = require("form-data");

      // Create FormData for continuing the interview
      const formData = new FormData();
      formData.append("domain", interview.domain);
      formData.append("difficulty", interview.difficulty);
      formData.append("user_response", userResponse);
      formData.append("session", interview.sessionId);

      // Dummy file (required by endpoint but not used for continuing)
      const dummyBuffer = Buffer.from("dummy", "utf8");
      formData.append("file", dummyBuffer, {
        filename: "dummy.txt",
        contentType: "text/plain",
      });

      // Add auth cookie
      const token = req.cookies.jwt;

      // Call Python service
      const response = await pythonAPI.post(
        "/api/v1/interview/resume-based",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Cookie: `jwt=${token}`,
          },
        }
      );

      aiResponse = response.data.ai;
    } catch (pythonError) {
      console.log(
        "Python service unavailable for continuation, using fallback"
      );

      // Fallback responses when Python service is unavailable
      const fallbackResponses = [
        "That's interesting! Can you elaborate on that point and provide a specific example?",
        "Thank you for sharing that. How would you handle a challenging situation in this area?",
        "Good insight! What do you think are the key skills needed to excel in this domain?",
        "I see. Can you walk me through your thought process when approaching such problems?",
        "That's a solid approach. What would you do differently if you had to optimize this further?",
        "Excellent! How do you stay updated with the latest trends in this field?",
        "Thank you for that detailed explanation. What challenges have you faced in similar scenarios?",
      ];

      // Use a different response based on conversation length
      const responseIndex = interview.QnA.length % fallbackResponses.length;
      aiResponse = fallbackResponses[responseIndex];
    }

    // Update interview session with new Q&A
    interview.QnA.push({
      bot: aiResponse,
      user: userResponse,
      createdAt: new Date(),
    });

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        question: aiResponse,
        sessionId: interview._id,
      },
    });
  } catch (error) {
    console.error("Error continuing resume-based interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to continue interview session",
      error: error.message,
    });
  }
});
