const mongoose = require('mongoose');
const interviewSchema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
      },
      domain: {
        type: String,
        required: true,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
      },
      QnA:[
        {
            bot:{
                type: String,
                required: true
            },
            user: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
      ],
      feedBack: {
        type: String,
        default: ''
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      score:{
        type: Number,
        default: 0
      }
    },
    {
      timestamps: true
    }
);

const InterviewSchema = mongoose.model('Interview', interviewSchema);

module.exports = InterviewSchema;