const GameTask = require('../models/gameTaskSchema');

module.exports = {
    index: (req, res) => {
        if(req.isAuthenticated()) {
            GameTask.find({}, (err, gameList) => {
                if(err) {
                    return err;
                } else {
                    // console.log(gameList);
                    res.render('pages/index', { user: req.user, gameList: gameList });
                }
            })
        } else {
            res.render('pages/index', {user: undefined})
        };
    },

    about: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/about', {user: req.user})
        } else {
            res.render('pages/about', {user: undefined})
        };
    },

    resources: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/resources', { user: req.user });    
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined })
        };
    },
};