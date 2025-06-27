const DQ = require("../models/dqModel");

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
