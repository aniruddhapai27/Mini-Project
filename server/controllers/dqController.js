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
    console.log("Total questions in DB:", allQuestions.length);

    // Filter questions by matching day, month, year
    const dq = allQuestions.filter((question) => {
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

    console.log(`Found ${dq.length} questions for today`);

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

    // Get all questions for this subject
    const allQuestionsForSubject = await DQ.find({ subject: subject });

    // Filter questions by matching day, month, year
    const questions = allQuestionsForSubject.filter((question) => {
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

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions available for ${subject} today`,
      });
    }

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
    const { answers, subject } = req.body;

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

    for (const answer of answers) {
      const { questionId, selectedOption, questionIndex } = answer;

      if (!questionId || selectedOption === undefined) {
        continue; // Skip invalid answers
      }

      // Find the question document by its _id
      const question = await DQ.findById(questionId);

      if (question) {
        // Convert option index to option key (0->option1, 1->option2, etc.)
        const selectedOptionKey = `option${selectedOption + 1}`;
        const isCorrect = selectedOptionKey === question.answer;

        if (isCorrect) {
          correctAnswers++;
        }

        // Get the correct answer index (option1->0, option2->1, etc.)
        const correctAnswerIndex =
          parseInt(question.answer.replace("option", "")) - 1;

        // Prepare detailed result for this question
        detailedResults.push({
          questionId: question._id,
          questionIndex: questionIndex || detailedResults.length,
          question: question.question,
          options: [
            question.option1,
            question.option2,
            question.option3,
            question.option4,
          ],
          userSelectedOption: selectedOption,
          userSelectedText: question[selectedOptionKey],
          correctOption: correctAnswerIndex,
          correctOptionText: question[question.answer],
          isCorrect,
          subject: question.subject,
        });
      }
    }

    // Sort detailed results by question index to maintain order
    detailedResults.sort((a, b) => a.questionIndex - b.questionIndex);

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
      summary: {
        percentage: score,
        questionsCorrect: correctAnswers,
        questionsIncorrect: totalQuestions - correctAnswers,
        totalQuestions,
        timeTaken: null, // Can be added if tracking time
        averageTimePerQuestion: null, // Can be calculated if tracking time
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
