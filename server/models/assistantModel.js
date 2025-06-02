const mongoose = require('mongoose');

const assistantSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        QnA: [
            {
                user: {
                    type: String,
                    required: true
                },
                bot: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Assistant = mongoose.model('Assistant', assistantSchema);
module.exports = Assistant;