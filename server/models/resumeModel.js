const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        grammaticalMistakes:{
            type: String,
            default: ''
        },
        suggestions:{
            type: String,
            default: ''
        },
        ATS: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;