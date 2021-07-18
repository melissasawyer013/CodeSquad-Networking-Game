const Graduate = require('../models/graduateSchema');
const passport = require("passport");
const authenticationInfo = require('../config/authorization');

module.exports = {
    profile: (req, res) => {
        res.render('pages/profile');
    },

    login: (req, res) => {
        res.render('pages/login');
    },

    checkEmail: (req, res) => {
        let emailEntered = req.body.email;
        Graduate.findOne({email: emailEntered}, (err, foundUser) => {
            if(err) {
                return err;
            } else {
                if(foundUser) {
                    authenticationInfo.userEmail = foundUser.email;
                    authenticationInfo.githubUrl = foundUser.githubUrl;
                    authenticationInfo.user = foundUser;
                    console.log(`userEmail: ${authenticationInfo.userEmail}`);
                    console.log(`githubUrl: ${authenticationInfo.githubUrl}`);
                    res.redirect('/profile/auth/github');
                } else {
                    res.redirect('/');
                }
                
            };
        });
    },

    GitHub_URI: passport.authenticate('github', {
        scope: [ 'read:user' ]
    }),

    githubCallback: [
        passport.authenticate('github', { failureRedirect: 'profile/login' }),
        function(req, res) {
            if(authenticationInfo.profileUrl === authenticationInfo.githubUrl) {
                res.redirect('/profile/success')
            } else {
                res.redirect('/');
            };  
        }
    ],

    success: (req, res) => {
        res.render('pages/success', {successMessage: `We did it Joe.`});
    },

    logout: (req, res) => {
        req.logout();
        authenticationInfo.profileUrl = undefined;
        authenticationInfo.githubUrl = undefined;
        authenticationInfo.user = undefined;
        authenticationInfo.userEmail = undefined;
        res.redirect('/');
    }

};