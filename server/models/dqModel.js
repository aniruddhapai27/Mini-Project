const mongoose = require('mongoose');

const dqSchema = mongoose.Schema(
    {
        questions: [
            {
                questionNum: {
                    type : Number,
                    required: true,
                },
                question: {
                    type: String,
                    required: true
                },
                options: {
                    type: [String],
                    required: true
                },
                answer: {
                    type: String,
                    required: true
                }
            }
        ],
        subject:{
            type: String,
            required: true,
        },
        date:{
            type: Date,
            default: Date.now
        }
    }, {
    timestamps: true
    }
);


const DQ = mongoose.model('DQ', dqSchema);
module.exports = DQ;

