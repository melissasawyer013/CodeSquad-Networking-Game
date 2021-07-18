const mongoose = require('mongoose');
const { Schema } = mongoose;
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const authenticationInfo = require('../config/authorization');

const graduateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cohortYear: {
        type: String
    },
    photoUrl: {
        type: String
    },
    githubUrl: {
        type: String
    },
    linkedinUrl: {
        type: String
    },
    totalPoints: {
        type: Number
    },
    tasksCompleted: {
        type: Array
    },
    adminStatus: {
        type: String
    },
    githubId: {
        type: String
    },
    githubProfile: {
        type: String
    }
}, {
    timestamps: true
});

const Graduate = mongoose.model('Graduate', graduateSchema);

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    Graduate.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5500/profile/auth/github/callback"
},
    function(accessToken, refreshToken, profile, done) {
        //conditional checks if the GitHub URL returned matches what was saved in the githubUrlToMatch variable from the database
        if (profile.profileUrl === authenticationInfo.githubUrlToMatch) {
            Graduate.findOne({ githubUrl: profile.profileUrl }, function (err, user) {
                Graduate.findOneAndUpdate({githubUrl: profile.profileUrl}, {$set: { githubId:profile.id }}, { new: true }, error => {})
                return done(err, user);
            });
        } else {
            console.log(`Not a match. Loggin out.`);
            return done;    
        };
    }
));

module.exports = Graduate;