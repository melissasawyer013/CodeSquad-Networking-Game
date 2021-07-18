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
    }
}, {
    timestamps: true
});

const Graduate = mongoose.model('Graduate', graduateSchema);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    Graduate.findById(authenticationInfo.user.id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5500/profile/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification
    process.nextTick(function () {
        const { id } = authenticationInfo.user._id;
        console.log(`The id is: ${id}`);
        authenticationInfo.profileUrl = profile.profileUrl;
        console.log(`returned profile: ${profile.profileUrl}`);
        
        //don't think I need htis
        Graduate.findByIdAndUpdate(id, {$set: {
            githubId: profile.id
        }})
        return done(null, profile, accessToken, refreshToken);
    });
  }
));

//58709646

//http://localhost:5500/profile/auth/github/callback?code=63b22e0f5adf739b0067

module.exports = Graduate;