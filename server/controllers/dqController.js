const DQ = require("../models/dqModel");
const QuizHistory = require("../models/quizHistoryModel");

exports.getDQ = async (req, res) => {
  try {
    // Get today's date components - using June 4th for testing since that's what we have in DB
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const todayYear = today.getFullYear();

    console.log(
      `Looking for questions on: ${todayDay}/${todayMonth}/${todayYear}`
    );

    // Get all questions and filter by date components
    const allQuestions = await DQ.find({})
      .select("-answer -created_at -updated_at ") // Exclude answer and timestamps
      .sort({ created_at: -1 });
    console.log("Total questions in DB:", allQuestions.length);    // Filter questions by matching day, month, year
    const filteredQuestions = allQuestions.filter((question) => {
      const questionDate = new Date(question.date);
      const questionDay = questionDate.getDate();
      const questionMonth = questionDate.getMonth() + 1;
      const questionYear = questionDate.getFullYear();

      return (
        questionDay === todayDay &&
        questionMonth === todayMonth &&
        questionYear === todayYear
      );
    });

    console.log(`Found ${filteredQuestions.length} questions for today`);    // Group questions by subject and limit to 10 per subject (case-insensitive)
    const questionsBySubject = {};
    filteredQuestions.forEach((question) => {
      const subjectKey = question.subject.toLowerCase();
      if (!questionsBySubject[subjectKey]) {
        questionsBySubject[subjectKey] = [];
      }
      if (questionsBySubject[subjectKey].length < 10) {
        questionsBySubject[subjectKey].push(question);
      }
    });

    // Log questions per subject
    Object.keys(questionsBySubject).forEach(subject => {
      console.log(`${subject}: ${questionsBySubject[subject].length} questions`);
    });

    // Flatten the grouped questions back into a single array
    const dq = Object.values(questionsBySubject).flat();

    res.status(200).json({
      success: true,
      size: dq.length,
      message: "Daily Questions fetched successfully",
      data: dq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get questions for a specific subject
exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject parameter is required",
      });
    } // Get today's date components - using June 4th for testing since that's what we have in DB
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const todayYear = today.getFullYear();

    // Get all questions for this subject (case-insensitive)
    const allQuestionsForSubject = await DQ.find({ 
      subject: { $regex: new RegExp(`^${subject}$`, 'i') }
    });    // Filter questions by matching day, month, year
    const filteredQuestions = allQuestionsForSubject.filter((question) => {
      const questionDate = new Date(question.date);
      const questionDay = questionDate.getDate();
      const questionMonth = questionDate.getMonth() + 1;
      const questionYear = questionDate.getFullYear();

      return (
        questionDay === todayDay &&
        questionMonth === todayMonth &&
        questionYear === todayYear
      );
    });

    if (filteredQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions available for ${subject} today`,
      });
    }

    // Limit to exactly 10 questions
    const questions = filteredQuestions.slice(0, 10);

    res.status(200).json({
      success: true,
      size: questions.length,
      message: `Questions for ${subject} fetched successfully`,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Submit answers and get score
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { answers, subject, totalTime, timePerQuestion } = req.body;
    const userId = req.user ? req.user._id : null; // Get user ID if authenticated

    if (!answers || !Array.isArray(answers) || !subject) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Expected answers array and subject.",
      });
    }

    // Calculate score and prepare detailed results
    let correctAnswers = 0;
    let totalQuestions = answers.length;
    const detailedResults = [];

    // Sort answers by questionIndex to maintain proper order
    const sortedAnswers = answers.sort((a, b) => {
      const indexA = a.questionIndex !== undefined ? a.questionIndex : 0;
      const indexB = b.questionIndex !== undefined ? b.questionIndex : 0;
      return indexA - indexB;
    });

    for (let i = 0; i < sortedAnswers.length; i++) {
      const answer = sortedAnswers[i];
      const { questionId, selectedOption, questionIndex } = answer;

      if (!questionId || selectedOption === undefined) {
        continue; // Skip invalid answers
      }

      // Find the question document by its _id
      const question = await DQ.findById(questionId);

      if (question) {
        // The answer field might be in different formats:
        // Format 1: "option1", "option2", etc.
        // Format 2: Literal answer text like "O(log n)", "Stack", etc.
        // Format 3: Numeric like "1", "2", "3", "4" (1-based index)
        
        const options = [question.option1, question.option2, question.option3, question.option4];
        let correctAnswerIndex = -1;
        let isCorrect = false;

        // Method 1: Check if answer is in "optionX" format
        if (question.answer && question.answer.toLowerCase().startsWith('option')) {
          const optionNumber = parseInt(question.answer.toLowerCase().replace('option', ''));
          if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= 4) {
            correctAnswerIndex = optionNumber - 1; // Convert to 0-based index
          }
        } 
        // Method 2: Check if answer is a numeric string (1-4)
        else if (question.answer && /^[1-4]$/.test(question.answer.toString().trim())) {
          const optionNumber = parseInt(question.answer);
          if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= 4) {
            correctAnswerIndex = optionNumber - 1; // Convert to 0-based index
          }
        }
        // Method 3: Try to find the literal answer in options (exact match)
        else if (question.answer) {
          correctAnswerIndex = options.findIndex(opt => 
            opt && opt.trim() === question.answer.trim()
          );
        }

        // Method 4: Try case-insensitive match
        if (correctAnswerIndex === -1 && question.answer) {
          correctAnswerIndex = options.findIndex(opt => 
            opt && question.answer && opt.trim().toLowerCase() === question.answer.trim().toLowerCase()
          );
        }

        // Method 5: Try partial matching (useful for long answers)
        if (correctAnswerIndex === -1 && question.answer) {
          correctAnswerIndex = options.findIndex(opt => 
            opt && (opt.includes(question.answer) || question.answer.includes(opt))
          );
        }

        // Calculate if user's answer is correct
        isCorrect = selectedOption === correctAnswerIndex;

        if (isCorrect) {
          correctAnswers++;
        }

        // Prepare detailed result for this question
        detailedResults.push({
          questionId: question._id,
          questionIndex: questionIndex !== undefined ? questionIndex : i,
          question: question.question,
          options: options,
          userSelectedOption: selectedOption,
          userSelectedText: options[selectedOption] || 'Unknown',
          correctOption: correctAnswerIndex,
          correctOptionText: correctAnswerIndex >= 0 ? options[correctAnswerIndex] : question.answer,
          isCorrect,
          subject: question.subject,
        });
      }
    }

    // Detailed results are already in correct order due to sorting at the beginning

    // Calculate percentage score
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Determine grade/performance level
    let grade = "F";
    let performance = "Poor";

    if (score >= 90) {
      grade = "A+";
      performance = "Excellent";
    } else if (score >= 80) {
      grade = "A";
      performance = "Very Good";
    } else if (score >= 70) {
      grade = "B";
      performance = "Good";
    } else if (score >= 60) {
      grade = "C";
      performance = "Average";
    } else if (score >= 50) {
      grade = "D";
      performance = "Below Average";
    }

    // Update user's score record if needed (this would be in a real implementation)
    // await User.findByIdAndUpdate(userId, {
    //   $push: { scores: { dq: answers[0].questionId, score, date: new Date() } },
    //   $inc: { current_streak: 1 }
    // });

    // Save quiz history if user is authenticated
    if (userId) {
      try {
        console.log('Saving quiz history with subject:', subject);
        const quizHistory = new QuizHistory({
          user: userId,
          subject,
          score,
          correctAnswers,
          totalQuestions,
          grade,
          performance,
          totalTime: totalTime || 0,
          timeTaken: totalTime ? Math.floor(totalTime / 1000) : 0,
          detailedResults,
        });
        const savedHistory = await quizHistory.save();
        console.log('Quiz history saved successfully:', { id: savedHistory._id, subject: savedHistory.subject });
      } catch (historyError) {
        console.error('Error saving quiz history:', historyError);
        // Don't fail the request if history saving fails
      }
    }

    res.status(200).json({
      success: true,
      score,
      correctAnswers,
      totalQuestions,
      grade,
      performance,
      subject,
      completedAt: new Date().toISOString(),
      detailedResults,
      totalTime: totalTime || null,
      timePerQuestion: timePerQuestion || null,
      timeTaken: totalTime ? Math.floor(totalTime / 1000) : null, // in seconds
      summary: {
        percentage: score,
        questionsCorrect: correctAnswers,
        questionsIncorrect: totalQuestions - correctAnswers,
        totalQuestions,
        timeTaken: totalTime ? Math.floor(totalTime / 1000) : null,
        averageTimePerQuestion: totalTime ? Math.floor(totalTime / 1000 / totalQuestions) : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test endpoint to check answer formats
exports.testAnswerFormats = async (req, res) => {
  try {
    const subjects = ['os', 'dbms', 'ds', 'ada', 'se', 'cn', 'operating systems', 'data structures', 'computer networks', 'database management systems', 'software engineering', 'algorithm design and analysis'];
    const results = {};

    for (const subject of subjects) {
      // Try both exact match and case-insensitive regex match
      let samples = await DQ.find({ subject: subject }).limit(3);
      if (samples.length === 0) {
        samples = await DQ.find({ 
          subject: { $regex: new RegExp(`^${subject}$`, 'i') }
        }).limit(3);
      }
      
      results[subject] = samples.map(q => {
        const options = [q.option1, q.option2, q.option3, q.option4];
        let answerFormat = 'unknown';
        let correctIndex = -1;
        
        // Determine the answer format
        if (q.answer && q.answer.toLowerCase().startsWith('option')) {
          answerFormat = 'optionX';
          const optionNumber = parseInt(q.answer.toLowerCase().replace('option', ''));
          if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= 4) {
            correctIndex = optionNumber - 1;
          }
        } else if (q.answer && /^[1-4]$/.test(q.answer.toString().trim())) {
          answerFormat = 'numeric';
          const optionNumber = parseInt(q.answer);
          if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= 4) {
            correctIndex = optionNumber - 1;
          }
        } else {
          answerFormat = 'literal';
          correctIndex = options.findIndex(opt => 
            opt && q.answer && opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
          );
        }
        
        return {
          id: q._id,
          question: q.question.substring(0, 80) + '...',
          answer: q.answer,
          answerFormat: answerFormat,
          correctIndex: correctIndex,
          options: options.map(opt => opt ? opt.substring(0, 30) + '...' : 'N/A')
        };
      });
    }

    res.status(200).json({
      success: true,
      message: "Answer format test results",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test endpoint to check what's in the database
exports.testDatabase = async (req, res) => {
  try {
    // Get total count
    const totalCount = await DQ.countDocuments();
    
    // Get all unique subjects
    const subjects = await DQ.distinct('subject');
    
    // Get sample documents
    const samples = await DQ.find({}).limit(5);
    
    res.status(200).json({
      success: true,
      message: "Database test results",
      data: {
        totalQuestions: totalCount,
        uniqueSubjects: subjects,
        sampleQuestions: samples.map(q => ({
          id: q._id,
          subject: q.subject,
          question: q.question.substring(0, 100) + '...',
          answer: q.answer,
          answerType: typeof q.answer,
          date: q.date,
          options: [q.option1, q.option2, q.option3, q.option4].map(opt => opt.substring(0, 30) + '...')
        }))
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's quiz history
exports.getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50, subject } = req.query;

    // Build query
    const query = { user: userId };
    if (subject) {
      query.subject = subject;
    }

    const quizzes = await QuizHistory.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('subject score correctAnswers totalQuestions grade performance date timeTaken');

    const total = await QuizHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        quizzes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalQuizzes: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get quiz statistics for graphs
exports.getQuizStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d', subject } = req.query;

    console.log('getQuizStats called with:', { userId, timeframe, subject });

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Debug: Check what quiz history exists for this user
    const allUserQuizzes = await QuizHistory.find({ user: userId }).select('subject date score');
    console.log('All quiz history for user:', allUserQuizzes);

    // Debug: Also check what subjects are in the DQ model
    const allSubjects = await DQ.distinct('subject');
    console.log('All subjects in DQ collection:', allSubjects);

    // Build query
    const query = {
      user: userId,
      date: { $gte: startDate }
    };
    
    if (subject) {
      // Make subject matching case-insensitive
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
      console.log('Filtering by subject (case-insensitive):', subject);
    }

    console.log('Query:', query);

    // Get daily best scores
    const dailyScores = await QuizHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
            subject: '$subject'
          },
          bestScore: { $max: '$score' },
          quizCount: { $sum: 1 },
          avgScore: { $avg: '$score' },
          date: { $first: '$date' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          },
          date: { $first: '$date' },
          subjects: {
            $push: {
              subject: '$_id.subject',
              bestScore: '$bestScore',
              quizCount: '$quizCount',
              avgScore: '$avgScore'
            }
          },
          overallBestScore: { $max: '$bestScore' },
          totalQuizzes: { $sum: '$quizCount' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    console.log('Daily scores aggregation result:', JSON.stringify(dailyScores, null, 2));

    // Get subject-wise statistics
    const subjectStats = await QuizHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$subject',
          totalQuizzes: { $sum: 1 },
          bestScore: { $max: '$score' },
          avgScore: { $avg: '$score' },
          totalCorrect: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' },
          lastQuizDate: { $max: '$date' }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    // Get overall stats
    const overallStats = await QuizHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          bestScore: { $max: '$score' },
          avgScore: { $avg: '$score' },
          totalCorrect: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyScores,
        subjectStats,
        overallStats: overallStats[0] || {
          totalQuizzes: 0,
          bestScore: 0,
          avgScore: 0,
          totalCorrect: 0,
          totalQuestions: 0
        },
        timeframe,
        dateRange: { start: startDate, end: now }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daily activity data for streak calendar
exports.getDailyActivityData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year = new Date().getFullYear() } = req.query;

    console.log('getDailyActivityData called with:', { userId, year });

    // Get start and end dates for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    console.log('Date range:', { startDate, endDate });

    // Query to get daily quiz submissions grouped by date
    const dailyActivity = await QuizHistory.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 },
          subjects: { $addToSet: '$subject' },
          bestScore: { $max: '$score' },
          avgScore: { $avg: '$score' },
          date: { $first: '$date' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          subjects: 1,
          bestScore: { $round: ['$bestScore', 0] },
          avgScore: { $round: ['$avgScore', 0] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    console.log('Daily activity aggregation result:', dailyActivity.length, 'days with activity');

    // Convert to an object with date strings as keys for easier frontend access
    const activityData = {};
    dailyActivity.forEach(day => {
      const dateString = day.date.toISOString().split('T')[0];
      activityData[dateString] = {
        count: day.count,
        subjects: day.subjects,
        bestScore: day.bestScore,
        avgScore: day.avgScore
      };
    });

    // Calculate year statistics
    const totalDays = dailyActivity.length;
    const totalSubmissions = dailyActivity.reduce((sum, day) => sum + day.count, 0);
    const avgSubmissionsPerDay = totalDays > 0 ? Math.round((totalSubmissions / totalDays) * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        activityData,
        statistics: {
          totalActiveDays: totalDays,
          totalSubmissions,
          avgSubmissionsPerDay,
          totalSubjects: [...new Set(dailyActivity.flatMap(d => d.subjects))].length
        }
      }
    });

  } catch (error) {
    console.error('Error in getDailyActivityData:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
