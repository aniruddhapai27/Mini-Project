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
const pythonAPI = require("../utils/pythonAPI");

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

// Get user's interview history with enhanced pagination
exports.getUserInterviewHistory = catchAsync(async (req, res) => {
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
    const [interviews, total] = await Promise.all([
      Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select(
          "domain difficulty score QnA createdAt feedBack resumeUsed sessionId"
        )
        .lean(), // Use lean() for better performance
      Interview.countDocuments({ user: userId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Validate if requested page exists
    if (page > totalPages && total > 0) {
      return res.status(400).json({
        success: false,
        message: `Page ${page} does not exist. Total pages: ${totalPages}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalInterviews: total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        // Backward compatibility
        totalPages,
        currentPage: page,
        totalInterviews: total,
      },
    });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
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

  console.log(
    "Creating interview session for userId:",
    userId,
    "Type:",
    typeof userId
  );

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
    const user = await User.findById(userId).select("resume");
    let resumeBuffer = null;
    let resumeFilename = "no_resume.txt";

    if (user && user.resume) {
      try {
        // Download resume from Cloudinary
        const response = await axios.get(user.resume, {
          responseType: "arraybuffer",
          timeout: 10000, // 10 second timeout
        });
        resumeBuffer = Buffer.from(response.data);
        resumeFilename = user.resume.split("/").pop() || "resume.pdf";
      } catch (downloadError) {
        console.log(
          "Failed to download user's resume, using default:",
          downloadError.message
        );
      }
    }

    let aiResponse, pythonSessionId;

    try {
      const FormData = require("form-data");

      // Create FormData to send to Python service
      const formData = new FormData();

      if (resumeBuffer) {
        formData.append("file", resumeBuffer, {
          filename: resumeFilename,
          contentType: resumeFilename.endsWith(".pdf")
            ? "application/pdf"
            : "text/plain",
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

      if (!token) {
        console.log("No JWT token found, using fallback approach");
        throw new Error("No authentication token available");
      }

      // Call Python service
      const response = await pythonAPI.post(
        "/api/v1/interview/resume-based",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Cookie: `jwt=${token}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      aiResponse = response.data.ai;
      pythonSessionId =
        response.data.session_id ||
        `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (pythonError) {
      console.log(
        "Python service unavailable, using fallback:",
        pythonError.message
      );

      // Enhanced domain-specific fallback responses
      const domainQuestions = {
        hr: "Hello! I'm excited to conduct this HR interview with you. Looking at your background, let's start by telling me about yourself and what interests you about this role?",
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

    // Create interview session in MongoDB with initial AI response
    const newInterview = new Interview({
      user: userId,
      domain: domain,
      difficulty: difficulty,
      QnA: [
        {
          bot: aiResponse, // Store the initial AI question immediately
          user: "", // Empty initially - will be filled when user responds
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

  // Ensure we have a valid Python session ID
  if (!interview.sessionId) {
    console.log("⚠️ No Python session ID found, generating fallback");
    interview.sessionId = `fallback_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await interview.save();
  }

  try {
    let aiResponse;

    try {
      const FormData = require("form-data");

      // Create FormData for continuing the interview
      const formData = new FormData();
      formData.append("domain", interview.domain);
      formData.append("difficulty", interview.difficulty);
      formData.append("user_response", userResponse);
      formData.append("session", interview.sessionId);

      // Dummy file (required by endpoint but not used for continuing)
      const dummyBuffer = Buffer.from("continuing interview", "utf8");
      formData.append("file", dummyBuffer, {
        filename: "continue.txt",
        contentType: "text/plain",
      });

      // Add auth cookie
      const token = req.cookies.jwt;

      if (!token) {
        console.log("No JWT token found for Python service call");
        throw new Error("Authentication token not available");
      }

      // Call Python service with timeout
      const response = await pythonAPI.post(
        "/api/v1/interview/resume-based",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Cookie: `jwt=${token}`,
          },
          timeout: 15000, // 15 second timeout
        }
      );

      aiResponse =
        response.data?.ai ||
        "Thank you for your response. Can you tell me more about that?";
    } catch (pythonError) {
      console.log("Python service unavailable, using fallback responses");

      // Enhanced fallback responses based on domain and conversation context
      const domainResponses = {
        hr: [
          "That's a great example! Can you tell me about a time when you had to work with a difficult team member?",
          "Interesting perspective! How do you handle stress and tight deadlines?",
          "Good insight! What motivates you in your professional career?",
          "Thank you for sharing that. Can you describe your leadership style?",
          "Excellent! How do you handle constructive criticism?",
          "That's valuable experience! What are your long-term career goals?",
          "Great answer! How do you prioritize tasks when everything seems urgent?",
        ],
        dataScience: [
          "Excellent technical insight! Can you walk me through a challenging data analysis project?",
          "That's a solid approach! How do you handle missing or dirty data?",
          "Good explanation! What's your experience with machine learning algorithms?",
          "Interesting! Can you explain your process for feature selection?",
          "Great understanding! How do you validate your models?",
          "That's insightful! What tools do you prefer for data visualization?",
          "Excellent! How do you communicate technical findings to non-technical stakeholders?",
        ],
        webdev: [
          "That's a great approach! Can you explain your preferred development workflow?",
          "Excellent! How do you ensure your applications are secure?",
          "Good thinking! What's your experience with version control systems?",
          "Can you describe your debugging process when you encounter issues?",
          "How do you stay updated with the latest web development trends?",
          "What's your approach to writing clean, maintainable code?",
          "Can you explain the difference between client-side and server-side rendering?",
        ],
        fullTechnical: [
          "Excellent technical insight! Can you explain your approach to system design?",
          "That's a solid answer! How do you approach debugging complex technical issues?",
          "Good explanation! What's your experience with database optimization?",
          "Can you walk me through your code review process?",
          "How do you ensure scalability in your applications?",
          "What's your approach to testing and quality assurance?",
          "Can you explain how you handle security considerations in your projects?",
        ],
      };

      const responses =
        domainResponses[interview.domain] || domainResponses.fullTechnical;
      const responseIndex = interview.QnA.length % responses.length;
      aiResponse = responses[responseIndex];
    }

    // Update interview session with new Q&A
    // Only add non-greeting messages to the conversation history
    const isGreeting =
      userResponse.trim() === "Hello, I am ready to start the interview." ||
      userResponse.trim() ===
        "Hello, I'm ready to start the interview. Please begin with your first question.";

    if (!isGreeting) {
      // Find the last QnA entry with empty user field and fill it
      for (let i = interview.QnA.length - 1; i >= 0; i--) {
        if (interview.QnA[i].user === "" || !interview.QnA[i].user) {
          interview.QnA[i].user = userResponse;
          interview.QnA[i].createdAt = new Date();
          break; // Only update the most recent empty user field
        }
      }

      // Add the new AI response as the next QnA entry
      if (aiResponse) {
        interview.QnA.push({
          bot: aiResponse,
          user: "", // Will be filled with next user response
          createdAt: new Date(),
        });
      }
    }

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

// Simple continue interview session (simplified version)
exports.continueInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { userResponse } = req.body;
  const userId = req.user._id;

  console.log(
    "continueInterviewSession called - sessionId:",
    sessionId,
    "userResponse:",
    userResponse?.substring(0, 50)
  );

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

  try {
    let aiResponse;

    // Try to use Python service first
    try {
      const FormData = require("form-data");

      // Create FormData for continuing the interview
      const formData = new FormData();
      formData.append("domain", interview.domain);
      formData.append("difficulty", interview.difficulty);
      formData.append("user_response", userResponse);

      if (interview.sessionId) {
        formData.append("session", interview.sessionId);
      }

      // Dummy file (required by endpoint)
      const dummyBuffer = Buffer.from("continuing interview", "utf8");
      formData.append("file", dummyBuffer, {
        filename: "continue.txt",
        contentType: "text/plain",
      });

      // Add auth cookie
      const token = req.cookies.jwt;

      // Call Python service with timeout
      const response = await pythonAPI.post(
        "/api/v1/interview/resume-based",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Cookie: `jwt=${token}`,
          },
          timeout: 15000, // 15 second timeout
        }
      );

      aiResponse =
        response.data?.ai ||
        "Thank you for your response. Can you tell me more about that?";
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
        "Interesting perspective! Can you share an example from your experience?",
        "Good point! How do you ensure quality in your work?",
        "That's valuable insight! What lessons have you learned from past projects?",
      ]; // Use a different response based on conversation length
      const responseIndex = interview.QnA.length % fallbackResponses.length;
      aiResponse = fallbackResponses[responseIndex];
    }

    // Update interview session with new Q&A
    // Only add non-greeting messages to the conversation history
    const isGreeting =
      userResponse.trim() === "Hello, I am ready to start the interview." ||
      userResponse.trim() ===
        "Hello, I'm ready to start the interview. Please begin with your first question.";

    if (!isGreeting) {
      // Find the last QnA entry with empty user field and fill it
      for (let i = interview.QnA.length - 1; i >= 0; i--) {
        if (interview.QnA[i].user === "" || !interview.QnA[i].user) {
          interview.QnA[i].user = userResponse;
          interview.QnA[i].createdAt = new Date();
          break; // Only update the most recent empty user field
        }
      }

      // Add the new AI response as the next QnA entry
      if (aiResponse) {
        interview.QnA.push({
          bot: aiResponse,
          user: "", // Will be filled with next user response
          createdAt: new Date(),
        });
      }
    }

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        question: aiResponse,
        sessionId: interview._id,
        questionNumber: interview.QnA.length,
        domain: interview.domain,
        difficulty: interview.difficulty,
      },
    });
  } catch (error) {
    console.error("Error continuing interview session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to continue interview session",
      error: error.message,
    });
  }
});

// Get AI-generated interview feedback from Python service
exports.getInterviewFeedback = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  console.log("📝 Getting feedback for session:", sessionId, "user:", userId);

  // Get interview session
  const interview = await Interview.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!interview) {
    console.log("❌ Interview session not found");
    return res.status(404).json({
      success: false,
      message: "Interview session not found",
    });
  }

  if (!interview.QnA || interview.QnA.length === 0) {
    console.log("❌ No conversation found in interview");
    return res.status(400).json({
      success: false,
      message: "No interview conversation found to analyze",
    });
  }

  console.log("📊 Interview found with", interview.QnA.length, "Q&A pairs");

  try {
    // Call Python service for feedback through the proxy
    console.log("🔄 Calling Python service for feedback...");

    // Get the JWT token from cookies (primary method for Python service)
    const jwtCookie = req.cookies.jwt;

    console.log("🔑 JWT Cookie available:", !!jwtCookie);
    console.log(
      "🔑 Cookie preview:",
      jwtCookie ? jwtCookie.substring(0, 20) + "..." : "none"
    );

    if (!jwtCookie) {
      console.log(
        "❌ No JWT cookie found, cannot authenticate with Python service"
      );
      return res.status(401).json({
        success: false,
        message: "Authentication token not found in cookies",
      });
    }

    console.log("📝 Request payload:", { session: sessionId });

    const response = await pythonAPI.post(
      "/api/v1/interview/feedback",
      {
        session: sessionId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Forward the JWT cookie to Python service
          Cookie: `jwt=${jwtCookie}`,
        },
      }
    );

    console.log("✅ Python service response received:", response.status);
    console.log("📊 Feedback data:", JSON.stringify(response.data, null, 2));

    // Update interview with feedback (response.data should contain the structured feedback)
    interview.feedBack = response.data;
    await interview.save();

    console.log("💾 Feedback saved to database successfully");

    res.status(200).json({
      success: true,
      message: "Interview feedback generated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error getting interview feedback:", error.message);
    console.error("Error details:", error.response?.data || error.message);
    console.error("Python service status:", error.response?.status);
    console.error(
      "Python service URL:",
      process.env.PYTHON_SERVICE_URL || "http://localhost:8000"
    );

    // Detailed error logging for debugging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    }

    // If Python service fails, provide domain-specific fallback response
    const domainFallbacks = {
      hr: {
        feedback: {
          technical_knowledge: "HR interviews focus on behavioral competencies rather than technical skills",
          communication_skills: "Communication appeared clear during the behavioral interview",
          confidence: "Showed appropriate confidence level for HR interview setting",
          problem_solving: "Demonstrated problem-solving through behavioral examples",
          suggestions: {
            technical_knowledge: "Continue developing leadership and people management skills",
            communication_skills: "Practice the STAR method for behavioral questions",
            confidence: "Prepare specific examples from your work experience",
            problem_solving: "Think of more challenging workplace scenarios to discuss",
          },
        },
        overall_score: 72,
      },
      dataScience: {
        feedback: {
          technical_knowledge: "Showed understanding of data science concepts during discussion",
          communication_skills: "Explained technical concepts reasonably well",
          confidence: "Demonstrated confidence in data science domain",
          problem_solving: "Applied analytical thinking to interview questions",
          suggestions: {
            technical_knowledge: "Review advanced machine learning algorithms and statistics",
            communication_skills: "Practice explaining complex data insights to non-technical audiences",
            confidence: "Build more hands-on experience with real-world datasets",
            problem_solving: "Work on end-to-end data science project workflows",
          },
        },
        overall_score: 75,
      },
      webdev: {
        feedback: {
          technical_knowledge: "Displayed solid understanding of web development technologies",
          communication_skills: "Communicated technical concepts effectively",
          confidence: "Showed confidence in web development skills",
          problem_solving: "Approached development challenges systematically",
          suggestions: {
            technical_knowledge: "Stay updated with latest frameworks and best practices",
            communication_skills: "Practice explaining architecture decisions to stakeholders",
            confidence: "Build more complex full-stack applications",
            problem_solving: "Focus on performance optimization and scalability challenges",
          },
        },
        overall_score: 73,
      },
      fullTechnical: {
        feedback: {
          technical_knowledge: "Demonstrated broad technical knowledge across multiple domains",
          communication_skills: "Explained technical solutions clearly",
          confidence: "Showed strong technical confidence",
          problem_solving: "Applied systematic approach to technical problems",
          suggestions: {
            technical_knowledge: "Deepen knowledge in system design and algorithms",
            communication_skills: "Practice whiteboarding and technical presentations",
            confidence: "Take on more challenging technical projects",
            problem_solving: "Focus on optimization and large-scale system challenges",
          },
        },
        overall_score: 74,
      },
    };

    const fallbackFeedback = domainFallbacks[interview.domain] || domainFallbacks.fullTechnical;

    res.status(500).json({
      success: false,
      message: "Failed to generate AI feedback, providing fallback response",
      data: fallbackFeedback,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// Text-to-speech functionality
exports.textToSpeech = catchAsync(async (req, res) => {
  const { text, voice = "Aaliyah-PlayAI" } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Text is required for text-to-speech conversion",
    });
  }

  try {
    // Get the auth token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found",
      });
    }

    // Call the Python API with the token in cookies
    const response = await axios.post(
      "https://my-project.tech/services/api/v1/interview/text-to-speech",
      {
        text: text,
        voice: voice,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        maxRedirects: 5,
        responseType: "arraybuffer", // Important for audio data
        timeout: 30000, // 30 second timeout
      }
    );

    // Set appropriate headers for audio response
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length,
      "Cache-Control": "no-cache",
      "Accept-Ranges": "bytes",
    });

    // Send the audio data back to the client
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Text-to-speech error:", error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.detail || "Failed to generate speech",
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        message: "Request timeout while generating speech",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while generating speech",
    });
  }
});

// Voice-to-text functionality
exports.voiceToText = catchAsync(async (req, res) => {
  console.log("📝 Voice-to-text request received");

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Audio file is required for voice-to-text conversion",
    });
  }

  try {
    // Get the auth token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found",
      });
    }

    // Create FormData to send to Python service
    const FormData = require("form-data");
    const formData = new FormData();

    // Add the audio file to form data
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log("🔊 Sending audio file to Python transcript service:", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Call the Python API with the token in cookies
    const response = await axios.post(
      "https://my-project.tech/services/api/v1/interview/transcript",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        maxRedirects: 5,
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("✅ Voice-to-text conversion successful");

    // Return the transcribed text
    res.status(200).json({
      success: true,
      data: {
        text: response.data.text,
      },
    });
  } catch (error) {
    console.error("Voice-to-text error:", error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message:
          error.response.data?.detail || "Failed to convert voice to text",
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        message: "Request timeout while converting voice to text",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while converting voice to text",
    });
  }
});
