/**
 * Interview Session Management Controller
 * 
 * This controller handles all interview session operations including:
 * - Creating new interview sessions
 * - Managing Q&A flow during interviews
 * - Storing conversation history
 * - Providing feedback and scoring
 * - Generating user statistics
 * 
 * All endpoints require user authentication
 */

const Interview = require('../models/interviewModel');
const { catchAsync } = require('../utils/catchAsync');

// Create a new interview session
exports.createInterviewSession = catchAsync(async (req, res) => {
  const { domain, difficulty } = req.body;
  const userId = req.user._id;

  if (!domain || !difficulty) {
    return res.status(400).json({
      success: false,
      message: 'Domain and difficulty are required'
    });
  }

  const newInterview = new Interview({
    user: userId,
    domain,
    difficulty,
    QnA: []
  });

  await newInterview.save();

  res.status(201).json({
    success: true,
    message: 'Interview session created successfully',
    data: {
      sessionId: newInterview._id,
      domain: newInterview.domain,
      difficulty: newInterview.difficulty,
      createdAt: newInterview.createdAt
    }
  });
});

// Get interview session by ID
exports.getInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({ 
    _id: sessionId, 
    user: userId 
  }).populate('user', 'name email');

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  res.status(200).json({
    success: true,
    data: interview
  });
});

// Generate AI interview question based on domain, difficulty, and conversation history
const generateAIQuestion = (domain, difficulty, conversationHistory) => {
  const questions = {
    hr: {
      easy: [
        "Tell me about yourself and why you're interested in this position.",
        "What are your greatest strengths and how do they apply to this role?",
        "Describe a time when you had to work as part of a team.",
        "How do you handle stress and pressure in the workplace?",
        "What motivates you in your professional life?",
        "Where do you see yourself in 5 years?",
        "Why are you looking to leave your current position?"
      ],
      medium: [
        "Tell me about yourself and your career aspirations.",
        "Describe a time when you had to deal with a difficult colleague or customer.",
        "How do you prioritize tasks when you have multiple deadlines?",
        "Tell me about a time you received constructive criticism and how you handled it.",
        "Describe a situation where you had to adapt to significant changes.",
        "How do you handle conflicts in the workplace?",
        "Tell me about a time when you went above and beyond your job duties."
      ],
      hard: [
        "Tell me about yourself and your leadership philosophy.",
        "Describe a time when you had to make an unpopular decision.",
        "How do you handle situations where you disagree with your manager?",
        "Tell me about a time you had to deliver difficult news to a team or client.",
        "How do you build trust and rapport with new team members?",
        "Describe a time when you had to influence others without direct authority.",
        "How do you handle ethical dilemmas in the workplace?"
      ]
    },
    'data-science': {
      easy: [
        "Tell me about yourself and your interest in data science.",
        "What is the difference between supervised and unsupervised learning?",
        "Explain what overfitting means and how to prevent it.",
        "How would you handle missing data in a dataset?",
        "What is the difference between correlation and causation?",
        "Describe the steps in a typical data science project workflow.",
        "What programming languages and tools do you use for data analysis?"
      ],
      medium: [
        "Tell me about yourself and your data science experience.",
        "How would you approach feature selection for a machine learning model?",
        "Explain the bias-variance tradeoff in machine learning.",
        "How would you evaluate the performance of a classification model?",
        "Describe how you would handle imbalanced datasets.",
        "What is cross-validation and why is it important?",
        "How would you explain a complex data science concept to a non-technical stakeholder?"
      ],
      hard: [
        "Tell me about yourself and your advanced data science expertise.",
        "How would you design an A/B testing framework for a large-scale application?",
        "Explain how you would build a recommendation system from scratch.",
        "How do you handle concept drift in production machine learning models?",
        "Describe your approach to feature engineering for time series data.",
        "How would you optimize a machine learning pipeline for real-time predictions?",
        "Explain how you would implement a distributed machine learning system."
      ]
    },
    webdev: {
      easy: [
        "Tell me about yourself and your web development background.",
        "What is the difference between HTML, CSS, and JavaScript?",
        "Explain what responsive web design means.",
        "How do you debug issues in web applications?",
        "What is the difference between GET and POST HTTP methods?",
        "Describe your experience with version control systems like Git.",
        "What front-end frameworks or libraries have you worked with?"
      ],
      medium: [
        "Tell me about yourself and your full-stack development experience.",
        "How would you optimize the performance of a web application?",
        "Explain the difference between client-side and server-side rendering.",
        "How do you handle state management in a React application?",
        "Describe your approach to API design and development.",
        "How do you ensure web accessibility in your applications?",
        "What security considerations do you keep in mind when developing web apps?"
      ],
      hard: [
        "Tell me about yourself and your senior web development expertise.",
        "How would you architect a microservices-based web application?",
        "Explain your approach to implementing real-time features in web applications.",
        "How do you handle caching strategies in a high-traffic web application?",
        "Describe how you would implement a CI/CD pipeline for a web application.",
        "How do you approach performance monitoring and optimization in production?",
        "Explain how you would design a scalable authentication system."
      ]
    },
    'full-technical': {
      easy: [
        "Tell me about yourself and your overall technical background.",
        "Explain the difference between a stack and a queue data structure.",
        "How do you approach problem-solving when faced with a new technical challenge?",
        "What is Big O notation and why is it important?",
        "Describe your experience with databases and SQL.",
        "How do you stay updated with new technologies and best practices?",
        "What is your preferred development environment and why?"
      ],
      medium: [
        "Tell me about yourself and your comprehensive technical experience.",
        "How would you design a URL shortener service like bit.ly?",
        "Explain the differences between SQL and NoSQL databases and when to use each.",
        "How do you approach code reviews and maintaining code quality?",
        "Describe your experience with cloud platforms and deployment strategies.",
        "How would you implement caching in a distributed system?",
        "Explain your approach to testing (unit, integration, end-to-end)."
      ],
      hard: [
        "Tell me about yourself and your senior-level technical leadership.",
        "How would you design a chat system that supports millions of concurrent users?",
        "Explain the CAP theorem and its implications for distributed systems.",
        "How do you approach system design for high availability and fault tolerance?",
        "Describe your experience with performance optimization at scale.",
        "How would you design a real-time analytics system for big data?",
        "Explain your approach to technical decision-making and architecture choices."
      ]
    }
  };

  const domainQuestions = questions[domain] || questions['full-technical'];
  const difficultyQuestions = domainQuestions[difficulty] || domainQuestions.easy;
  
  // Return question based on conversation length, cycling through if we run out
  const questionIndex = conversationHistory.length;
  return difficultyQuestions[questionIndex % difficultyQuestions.length];
};

// Enhanced updateInterviewSession to include AI response generation
exports.updateInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { bot, user } = req.body;
  const userId = req.user._id;

  if (!bot || !user) {
    return res.status(400).json({
      success: false,
      message: 'Both bot and user responses are required'
    });
  }

  const interview = await Interview.findOne({ 
    _id: sessionId, 
    user: userId 
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  // Add the current QnA to the session
  const currentQnA = {
    bot,
    user,
    createdAt: new Date()
  };

  interview.QnA.push(currentQnA);
  await interview.save();

  // Generate next AI question
  const nextAIQuestion = generateAIQuestion(
    interview.domain,
    interview.difficulty,
    interview.QnA
  );

  res.status(200).json({
    success: true,
    message: 'Interview session updated successfully',
    data: {
      sessionId: interview._id,
      latestQnA: currentQnA,
      totalQuestions: interview.QnA.length,
      nextQuestion: nextAIQuestion
    }
  });
});

// Generate interview feedback
const generateInterviewFeedback = (interview) => {
  const questionCount = interview.QnA.length;
  const domain = interview.domain;
  const difficulty = interview.difficulty;
  
  // Calculate score based on various factors
  let score = 60; // Base score
  
  // Bonus for completing more questions
  score += Math.min(30, questionCount * 5);
  
  // Difficulty modifier
  const difficultyBonus = {
    'easy': 0,
    'medium': 5,
    'hard': 10
  };
  score += difficultyBonus[difficulty] || 0;
  
  // Random variation to simulate AI scoring (±7 points)
  score += Math.floor(Math.random() * 15) - 7;
  
  // Ensure score is within bounds
  score = Math.max(50, Math.min(100, score));
  
  const feedbackTemplates = {
    technical: {
      high: "Excellent technical knowledge! You demonstrated strong problem-solving skills and clear communication of complex concepts. Your answers showed deep understanding of the subject matter.",
      medium: "Good technical foundation. Focus on providing more specific examples and explaining your thought process more clearly. Consider diving deeper into implementation details.",
      low: "You have potential! Work on strengthening your technical fundamentals and practice explaining concepts more clearly. Consider reviewing core concepts and practicing coding problems."
    },
    behavioral: {
      high: "Outstanding communication and storytelling! You provided specific examples using the STAR method and showed great self-awareness. Your responses demonstrated strong leadership qualities.",
      medium: "Good behavioral responses. Try to use more specific examples and quantify your achievements when possible. Focus on demonstrating impact and results.", 
      low: "Work on using the STAR method (Situation, Task, Action, Result) to structure your behavioral responses better. Practice telling stories that highlight your contributions and learnings."
    },
    'system-design': {
      high: "Impressive system design thinking! You considered scalability, trade-offs, and asked great clarifying questions. Your approach showed excellent understanding of distributed systems principles.",
      medium: "Solid system design approach. Focus more on discussing trade-offs and alternative solutions. Consider addressing scalability and reliability concerns more thoroughly.",
      low: "Good start on system design. Practice breaking down problems systematically and discussing scalability considerations. Focus on understanding fundamental distributed systems concepts."
    },
    product: {
      high: "Excellent product sense! You balanced user needs with business objectives and showed strong analytical thinking. Your framework for decision-making was well-structured.",
      medium: "Good product thinking. Focus more on metrics and how you would measure success. Consider discussing user research methods and prioritization frameworks.",
      low: "Develop your product intuition by practicing case studies and thinking about user-centric solutions. Focus on understanding how to validate assumptions and measure impact."
    }
  };
  
  const domainFeedback = feedbackTemplates[domain] || feedbackTemplates.technical;
  let feedback;
  
  if (score >= 80) {
    feedback = domainFeedback.high;
  } else if (score >= 65) {
    feedback = domainFeedback.medium;
  } else {
    feedback = domainFeedback.low;
  }
  
  return {
    score,
    feedback: `${feedback} You completed ${questionCount} questions in this ${difficulty} ${domain} interview. Keep practicing to improve your interview skills!`
  };
};

// Enhanced endInterviewSession with feedback generation
exports.endInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { finalScore, feedback } = req.body;
  const userId = req.user._id;

  const interview = await Interview.findOne({ 
    _id: sessionId, 
    user: userId 
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  // Generate feedback if not provided
  let interviewResults;
  if (finalScore !== undefined && feedback) {
    interviewResults = { score: finalScore, feedback };
  } else {
    interviewResults = generateInterviewFeedback(interview);
  }

  // Update final score and feedback
  interview.score = interviewResults.score;
  interview.feedBack = interviewResults.feedback;

  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Interview session ended successfully',
    data: {
      sessionId: interview._id,
      totalQuestions: interview.QnA.length,
      finalScore: interview.score,
      feedback: interview.feedBack,
      domain: interview.domain,
      difficulty: interview.difficulty
    }
  });
});

// Get interview conversation history
exports.getInterviewConversation = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({ 
    _id: sessionId, 
    user: userId 
  }).populate('user', 'name email');

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      sessionId: interview._id,
      conversation: interview.QnA,
      domain: interview.domain,
      difficulty: interview.difficulty,
      status: interview.status,
      createdAt: interview.createdAt
    }
  });
});

// Delete interview session
exports.deleteInterviewSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOneAndDelete({ 
    _id: sessionId, 
    user: userId 
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Interview session deleted successfully'
  });
});

// Update interview feedback
exports.updateInterviewFeedback = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { feedback } = req.body;
  const userId = req.user._id;

  const interview = await Interview.findOne({ 
    _id: sessionId, 
    user: userId 
  });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found'
    });
  }

  interview.feedBack = feedback;
  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Feedback updated successfully',
    data: {
      sessionId: interview._id,
      feedback: interview.feedBack
    }
  });
});

// Get interview statistics
exports.getInterviewStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const stats = await Interview.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        completedInterviews: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        totalXP: { $sum: '$XP' },
        domains: { $addToSet: '$domain' }
      }
    }
  ]);

  const recentInterviews = await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('domain difficulty score status createdAt');

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        totalXP: 0,
        domains: []
      },
      recentInterviews
    }
  });
});

// Get user interview history
exports.getUserInterviewHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, domain, status } = req.query;

  const filter = { user: userId };
  if (domain) filter.domain = domain;
  if (status) filter.status = status;

  const interviews = await Interview.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('domain difficulty score status createdAt updatedAt XP');

  const total = await Interview.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      interviews,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Get recent interviews
exports.getRecentInterviews = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { limit = 5 } = req.query;

  const interviews = await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('domain difficulty score status createdAt XP');

  res.status(200).json({
    success: true,
    data: { interviews }
  });
});
