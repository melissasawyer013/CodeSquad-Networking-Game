const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');
const Score = require('../models/scoreSchema');
const passport = require("passport");
const authenticationInfo = require('../config/authorization');

module.exports = {
    profile: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/profile', { user: req.user, message: undefined });    
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined })
        }; 
    },

    login: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/profile', { user: req.user, message: undefined });
        } else {
            res.render('pages/login', { message: undefined, user: undefined });
        };
    },

    checkEmail: (req, res) => {
        let emailEntered = req.body.email;
        Graduate.findOne({email: emailEntered}, (err, foundUser) => {
            if(err) {
                return err;
            } else {
                if(foundUser) {
                    authenticationInfo.githubUrlToMatch = foundUser.githubUrl;
                    authenticationInfo.githubProfileToMatch = foundUser.githubProfile;
                    res.redirect('/profile/auth/github');
                } else {
                    res.render('pages/login', { message: `It seems that your email does not match what we have. Try the email associated with CodeSquad, or email melissa@codesquad.org to verify you're using the correct email address or request a change in the email associated with your account.`, user: undefined });
                } 
            };
        });
    },

    GitHub_URI: passport.authenticate('github', {
        scope: [ 'read:user' ], 
    }),

    githubCallback: [
        passport.authenticate('github', { failureRedirect: 'profile/login' }),
        function(req, res) {
            if(req.isAuthenticated) {
                res.redirect('/');
            } else {
                res.redirect('/profile/logout');
            };
        }
    ],

    logout: (req, res) => {
        if(req.isAuthenticated()) {
            req.logout();
            authenticationInfo.githubProfileToMatch = undefined;
            authenticationInfo.githubUrlToMatch = undefined;
            res.redirect('/');    
        } else {
            res.redirect('/')
        } 
    },

    updateGameTask: (req, res) => {
        if(req.isAuthenticated()) {
            const { id } = req.params;
            GameTask.findByIdAndUpdate(id, {$push: {
                graduatesCompleted: {
                    'name': req.user.name,
                    'dateAdded': new Date(),
                    'dateCompleted': req.body.dateCompleted,
                }
            }}, {new: true}, err => {
                if (err) {
                    return err;
                } else {
                    res.redirect(`/profile/updateGraduateTask/${id}/${req.body.dateCompleted}`);
                }
            })
        }
    },

    updateGraduateTask: (req, res) => {
        if(req.isAuthenticated()) {
            const { id } = req.params;
            const { date } = req.params;
            GameTask.findOne({_id: id}, (err, gameTask) => {
                if(err) {
                    return err;
                } else {
                    let gameTaskCategory = gameTask.category;
                    let gameTaskTask = gameTask.task;
                    let gameTaskPoints = gameTask.points;
                    let gradPoints = req.user.totalPoints + gameTaskPoints;
                    Graduate.findOneAndUpdate({_id: req.user._id}, {
                        $set: {totalPoints: gradPoints}, 
                        $push: {
                            tasksCompleted: {
                                'category': gameTaskCategory,
                                'task': gameTaskTask,
                                'points': gameTaskPoints,
                                'dateAdded': new Date(),
                                'dateCompleted': date,
                            }
                    }}, {new: true}, error => {
                        if(error) {
                            return error;
                        } else {
                            res.redirect('/')
                        }
                    })
                }
            })
        }
    },
};