const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameListSchema = new Schema({
    basics: {
        type: Array
    },
    profile: {
        type: Array
    },
    learning: {
        type: Array
    },
    portfolio: {
        type: Array
    },
    network: {
        type: Array
    },
    jobs: {
        type: Array
    }
});

const GameList = mongoose.model('GameList', gameListSchema);

module.exports = GameList;
