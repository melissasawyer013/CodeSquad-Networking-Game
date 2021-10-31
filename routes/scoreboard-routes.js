const express = require('express');
const router = express.Router();
const scoreboardController = require('../controllers/scoreboard-controller');

// route for /scoreboard
router.route('/')
    .get(scoreboardController.scoreboard);

router.route('/search')
    .post(scoreboardController.lookup)

// router.route('/scoreboardMonth/:sortedGradsAllTime')
//     .get(scoreboardController.scoreboardMonth);

module.exports = router;