const mongoose = require('mongoose');
const { Schema } = mongoose;

const scoreSchema = new Schema({
    graduate: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    dateCompleted: {
        type: Date,
        required: true
    },
    dateEntered: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;