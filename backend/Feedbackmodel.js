const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    course_id: {
        type: Number,
        required: true,
        unique: true,
    },

    course_name: {
        type: String,
        required: true,
        minlength: 3,
    },

    course_duration: {
        type: String,
        default: 'Self-paced',
    },

    feedback_comments: {
        type: String,
        required: true,
    },

    feedback_rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
});

module.exports = mongoose.model('Feedback', feedbackSchema);