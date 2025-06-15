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
    technical: {
      easy: [
        "Tell me about yourself and your programming background.",
        "What programming languages are you most comfortable with and why?",
        "Explain the difference between an array and a linked list.",
        "How do you debug code when something isn't working?",
        "What's your favorite coding project you've worked on?",
        "How do you stay updated with new technologies?",
        "Describe your experience with version control systems like Git."
      ],
      medium: [
        "Tell me about yourself and your technical experience.",
        "Walk me through how you would design a simple web application.",
        "Explain the concept of object-oriented programming with an example.",
        "How would you optimize a slow database query?",
        "Describe a challenging technical problem you've solved recently.",
        "What are the differences between SQL and NoSQL databases?",
        "How do you approach testing in your development process?"
      ],
      hard: [
        "Tell me about yourself and your senior-level experience.",
        "How would you design a distributed system for handling millions of users?",
        "Explain the trade-offs between consistency and availability in distributed systems.",
        "How would you approach debugging a performance issue in a microservices architecture?",
        "Describe your experience with system design and scalability challenges.",
        "How do you handle data consistency in distributed transactions?",
        "What strategies do you use for optimizing application performance at scale?"
      ]
    },
    behavioral: {
      easy: [
        "Tell me about yourself and what interests you about this role.",
        "Describe a time when you had to work with a difficult team member.",
        "How do you handle stress and pressure in your work?",
        "Tell me about a mistake you made and how you learned from it.",
        "What motivates you in your professional life?",
        "How do you prioritize your tasks during a busy day?",
        "Describe a time when you received constructive feedback."
      ],
      medium: [
        "Tell me about yourself and your leadership experience.",
        "Describe a time when you had to convince someone to see your point of view.",
        "How do you prioritize tasks when everything seems urgent?",
        "Tell me about a time you had to make a difficult decision with limited information.",
        "Describe a situation where you had to adapt to significant changes.",
        "How do you handle conflicts within your team?",
        "Tell me about a time when you went above and beyond your job responsibilities."
      ],
      hard: [
        "Tell me about yourself and your track record of driving results.",
        "Describe a time when you led a team through a major organizational change.",
        "How do you handle conflicts between competing stakeholders?",
        "Tell me about a time you had to deliver bad news to senior leadership.",
        "Describe your approach to building and maintaining high-performing teams.",
        "How do you influence others when you don't have direct authority?",
        "Tell me about a time when you had to make a decision that was unpopular but necessary."
      ]
    },
    'system-design': {
      easy: [
        "Tell me about yourself and your experience with system design.",
        "How would you design a simple URL shortener like bit.ly?",
        "Explain how you would design a basic chat application.",
        "What databases would you choose for different types of data?",
        "How would you handle user authentication in a web application?",
        "Describe how you would design a simple file upload system.",
        "How would you implement caching in a web application?"
      ],
      medium: [
        "Tell me about yourself and your architecture experience.",
        "Design a social media feed system like Twitter's timeline.",
        "How would you design a file storage system like Dropbox?",
        "Explain how you would design a real-time notification system.",
        "How would you design a system to handle online payments?",
        "Design a recommendation system for an e-commerce platform.",
        "How would you architect a multi-tenant SaaS application?"
      ],
      hard: [
        "Tell me about yourself and your experience with large-scale systems.",
        "Design a global content delivery network (CDN).",
        "How would you design a search engine like Google?",
        "Explain how you would design a distributed database system.",
        "Design a real-time analytics system for millions of events per second.",
        "How would you design a video streaming platform like Netflix?",
        "Design a distributed logging and monitoring system."
      ]
    },
    product: {
      easy: [
        "Tell me about yourself and your interest in product management.",
        "How would you prioritize features for a mobile app?",
        "Describe how you would gather user feedback for a new product.",
        "How do you define success for a product feature?",
        "What's your process for making data-driven decisions?",
        "How do you balance user needs with business constraints?",
        "Describe how you would conduct user research for a new feature."
      ],
      medium: [
        "Tell me about yourself and your product management experience.",
        "How would you launch a new product in a competitive market?",
        "Describe how you would work with engineering teams to deliver features.",
        "How do you balance user needs with business objectives?",
        "Tell me about a time you had to pivot a product strategy.",
        "How do you measure the success of a product after launch?",
        "Describe your approach to competitive analysis."
      ],
      hard: [
        "Tell me about yourself and your track record in product leadership.",
        "How would you develop a product strategy for entering a new market?",
        "Describe how you would build and lead a product organization.",
        "How do you align multiple stakeholders around a product vision?",
        "Tell me about a time you had to make a tough product decision with significant trade-offs.",
        "How do you scale product management processes as a company grows?",
        "Describe your approach to building a product roadmap for the next 3 years."
      ]
    }
  };

  const domainQuestions = questions[domain] || questions.technical;
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
