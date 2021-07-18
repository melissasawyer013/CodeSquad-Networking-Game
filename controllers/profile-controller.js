const Graduate = require('../models/graduateSchema');
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
                res.redirect('/profile/');
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

};