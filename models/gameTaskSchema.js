const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameTaskSchema = new Schema({
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
    graduatesCompleted: {
        type: Array,
    }
});

const GameTask = mongoose.model('GameTask', gameTaskSchema);

module.exports = GameTask;
