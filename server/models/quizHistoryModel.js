const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  performance: {
    type: String,
    required: true,
  },
  totalTime: {
    type: Number, // in milliseconds
    default: 0,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  detailedResults: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DQ',
      },
      question: String,
      userSelectedOption: Number,
      userSelectedText: String,
      correctOption: Number,
      correctOptionText: String,
      isCorrect: Boolean,
    }
  ],
}, {
  timestamps: true,
});

// Index for efficient queries
quizHistorySchema.index({ user: 1, date: -1 });
quizHistorySchema.index({ user: 1, subject: 1, date: -1 });

module.exports = mongoose.model('QuizHistory', quizHistorySchema);
