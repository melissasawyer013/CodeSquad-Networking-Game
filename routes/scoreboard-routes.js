const express = require('express');
const router = express.Router();
const scoreboardController = require('../controllers/scoreboard-controller');

// route for /scoreboard
router.route('/')
    .get(scoreboardController.scoreboard);




module.exports = router;