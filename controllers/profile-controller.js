const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');
const Score = require('../models/scoreSchema');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;
const authenticationInfo = require('../config/authorization');

module.exports = {
    profile: (req, res) => {
        console.log(req.isAuthenticated());
        if(req.isAuthenticated()) {
            const { message } = req.params;
            res.render('pages/profile', { user: req.user, message: message, completedTasks: req.user.tasksCompleted });    
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
                    //to work locally, must change GitHub callback URL in GitHub dev tools from https://codesquad-the-game.herokuapp.com/profile/auth/github/callback to http://localhost:5500/profile/auth/github/callback - also need to change the graduateSchema.js line 62 or 63
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
            if(req.isAuthenticated()) {
                let message = `none`;
                res.redirect(`/home/${message}`);
            } else {
                res.redirect('/profile/logout');
            };
        }
    ],

    logout: (req, res) => {
        let message = `none`;
        if(req.isAuthenticated()) {
            req.logout();
            authenticationInfo.githubProfileToMatch = undefined;
            authenticationInfo.githubUrlToMatch = undefined;
            res.redirect(`/`);
            // res.redirect(`/home/${message}`);    
        } else {
            res.redirect(`/`)
        } 
    },

    // callback to update the GameTask document in the database for newly completed tasks: adds an object to the graduatesCompleted array
    updateGameTask: (req, res) => {
        if(req.isAuthenticated()) {
            const { id } = req.params;
            const { date } = req.params;
            //creates a new ObjectId here so that the object entered in the gametask document under graduatesCompleted will have the same _id as the object in the user's tasksCompleted array - need to be the same to be able to update the dateCompleted in both spots
            let matchingId = new ObjectId();
            GameTask.findByIdAndUpdate(id, {$push: {
                graduatesCompleted: {
                    '_id': matchingId,
                    'name': req.user.name,
                    'dateAdded': new Date(),
                    'dateEdited': new Date(),
                    'dateCompleted': date,
                }
            }}, {new: true}, err => {
                if (err) {
                    return err;
                } else {
                    //when successful in updating the GameTask document, goes to route to update the Graduate document 
                    res.redirect(`/profile/updateGraduateTask/${id}/${date}/${matchingId}`);
                }
            })
        }
    },

    // callback to update the Graduate document in the database for newly completed tasks: adds an object to the tasksCompleted array and updates the score
    updateGraduateTask: (req, res) => {
        if(req.isAuthenticated()) {
            const { id } = req.params;
            const { date } = req.params;
            const { match } = req.params;
            GameTask.findOne({_id: id}, (err, gameTask) => {
                if(err) {
                    return err;
                } else {
                    let gameTaskCategory = gameTask.category;
                    let gameTaskTask = gameTask.task;
                    let gameTaskPoints = gameTask.points;
                    let gameMaxRate = gameTask.maxRate;
                    let gradPoints = req.user.totalPoints + gameTaskPoints;
                    Graduate.findOneAndUpdate({_id: req.user._id}, {
                        $set: {totalPoints: gradPoints}, 
                        $push: {
                            tasksCompleted: {
                                '_id': match,
                                'category': gameTaskCategory,
                                'task': gameTaskTask,
                                'points': gameTaskPoints,
                                'maxRate': gameMaxRate,
                                'dateAdded': new Date(),
                                'dateEdited': new Date(),
                                'dateCompleted': date,
                            }
                    }}, {new: true}, error => {
                        if(error) {
                            return error;
                        } else {
                            let message = `The task was marked complete, and your point total went up by ${gameTaskPoints}.`;
                            res.redirect(`/home/${message}`)
                        }
                    })
                }
            })
        }
    },

    editProfile: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/profile-edit', { user: req.user })
        }
    },

    updateProfile: (req, res) => {
        if(req.isAuthenticated()) {
            const { id } = req.params;
            let message = `Your profile information has been successfully updated.`;
            Graduate.findByIdAndUpdate(id, {$set: {
                name: req.body.name,
                email: req.body.email,
                linkedinUrl: req.body.linkedinUrl,
            }}, { new: true }, err => {
                if(err) {
                    return err;
                } else {
                    res.redirect(`/profile/page/${message}`);
                };
            })
        } else {
            res.render('pages/login', {message: `You must be logged in to edit your profile.`, user: undefined})
        }
    },

    checkUpdateTaskDate: (req, res, err) => {
        if(req.isAuthenticated()) {
            let { id } = req.params;
            let { maxRate } = req.params;
            let { task } = req.params;
            let { redirect } = req.params;
            //check incoming date change requests - if maxRate is 'daily' the task can only be done once per day and the route needs to check that the same task hasn't already been completed on the day the user is changing the date completed to
            if (maxRate === 'daily') {
                let tasksCompletedArray = req.user.tasksCompleted;
                for( let i = 0; i < tasksCompletedArray.length; i++) {
                    //for each task in tasksCompleted array in database, flag
                    if (task === tasksCompletedArray[i].task && req.body.dateCompleted === tasksCompletedArray[i].dateCompleted) {
//Eventually have profile/homepage accept messages and send a message that they can't change the date completed to that date because the same task has already been completed on that day, and you can only do it once per day.                    
                        let message = `You can't do that because you already completed that task on that date.`
                        if(redirect === 'profile') {
                            res.redirect(`/profile/page/${message}`);
                            //Without the return err, got error: Cannot set headers after they are sent to the client.
                            return err;
                            break;
                        } else if (redirect === 'game' || redirect === 'game new') {
                            res.redirect(`/home/${message}`);
                            //Without the return err, got error: Cannot set headers after they are sent to the client.
                            return err;
                            break;
                        }
                    };
                };
                // if there are no date conflicts, routed to next step
                if (redirect === 'profile' || redirect === 'game') {
                    res.redirect(`/profile/updateTaskDate/${id}/${req.body.dateCompleted}/${redirect}`);
                } else if (redirect === 'game new') {
                    res.redirect(`/profile/updateGameTask/${id}/${req.body.dateCompleted}`)
                }
                
            } else {
                if (redirect === 'profile' || redirect === 'game') {
                    res.redirect(`/profile/updateTaskDate/${id}/${req.body.dateCompleted}/${redirect}`);
                } else if (redirect === 'game new') {
                    res.redirect(`/profile/updateGameTask/${id}/${req.body.dateCompleted}`)
                }
            }
        } else {
            res.render('pages/login', {message: `You must be logged in to edit this date.`, user: undefined});
        };
    },

    updateTaskDate: (req, res) => {
        if(req.isAuthenticated()) {
            //id being passed as parameter is the id of the object inside of the tasksCompleted array in the gradudate's database entry
            let { id } = req.params;
            let { newDate } = req.params;
            let { redirect } = req.params;
            let tasksCompletedArray = req.user.tasksCompleted;
            let indexToChange;
            //used this method instead of findByIdAndUpdate because could not get $set to update subdocuments. 
            Graduate.findById(req.user._id, function(err, result) {
                if(!err) {
                    if(!result){
                        let message = `Success! Your task and points have been recorded.`;
                        if (redirect === 'profile') {
                            res.redirect(`/profile/page/${message}`);
                        } else if (redirect === 'game') {
                            res.redirect(`/home/${message}`);
                        };   
                    } else {
                        tasksCompletedArray.forEach(task => {
                            if(id == task._id) {
                                //gets the location of the task in the array of tasks completed to be able to change correct task's date
                                indexToChange = tasksCompletedArray.indexOf(task);
                                //changes the date completed for the task in the database to what was entered by the user, must include the markModified on the array or changes will not save in database
                                result.tasksCompleted[indexToChange].dateCompleted = newDate;
                                result.markModified('tasksCompleted');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        //redirects to route that will update the GameTask entry array where grads who have completed the task + date they completed it are stored - passes in parameters for 1) the id of the tasksCompleted object (which matches the id in the gametasks's graduatesCompleted object), 2) the new date completed, and 3) the task string
                                        res.redirect(`/profile/updateGameTaskGradDate/${id}/${newDate}/${result.tasksCompleted[indexToChange].task}/${redirect}`);
                                    };
                                });  
                            };
                        });  
                    };
                } else {
                    return err;
                };
            });
        } else {
            res.render('pages/login', {message: `You must be logged in to edit this date.`, user: undefined});
        };
    },

    updateGameTaskGradDate: (req, res) => {
        let { id } = req.params;
        let { date } = req.params;
        let { task } = req.params;
        let { redirect } = req.params;
        if(req.isAuthenticated()) {
            let gradsCompletedArray;
            let indexToChange;
            //used this method instead of findByIdAndUpdate because could not get $set to update subdocuments. 
            GameTask.findOne({task: task}, function(err, result) {
                if(!err) {
                    if(!result){
                        let message = `Try again. We couldn't find that task in the database.`;
                        if (redirect === 'profile') {
                            res.redirect(`/profile/page/${message}`);
                        } else if (redirect === 'game') {
                            res.redirect(`/home/${message}`);
                        };   
                    } else {
                        gradsCompletedArray = result.graduatesCompleted;
                        gradsCompletedArray.forEach(entry => {
                            if(id == entry._id) {
                                //gets the location of the grad entry in the array of graduatesCompleted to be able to change correct entry's date
                                indexToChange = gradsCompletedArray.indexOf(entry);
                                //changes the date completed for the entry in the database to what was entered by the user, must include the markModified on the array or changes will not save in database
                                result.graduatesCompleted[indexToChange].dateCompleted = date;
                                result.markModified('graduatesCompleted');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        let message = `The date completed has successfully been updated!`;
                                        if (redirect === 'profile') {
                                            res.redirect(`/profile/page/${message}`);
                                        } else if (redirect === 'game') {
                                            res.redirect(`/home/${message}`);
                                        };   
                                    };
                                });  
                            };
                        });  
                    };
                } else {
                    return err;
                };
            });
        } else {
            res.render('pages/login', {message: `You must be logged in to edit this date.`, user: undefined})
        };
    },

    deleteGradTask: (req, res) => {
        if(req.isAuthenticated()) {
            let { id } = req.params;
            let { redirect } = req.params;
            let tasksCompletedArray = req.user.tasksCompleted;
            let indexToDelete;
            Graduate.findById(req.user._id, function(err, result) {
                if(!err) {
                    if(!result) {
                        let message = `There was an error in deleting the task. Try again please.`;
                        if (redirect === 'profile') {
                            res.redirect(`/profile/page/${message}`);
                        } else if (redirect === 'game') {
                            res.redirect(`/home/${message}`);
                        }; 
                    } else {
                        tasksCompletedArray.forEach(task => {
                            if(id == task._id) {
                                result.totalPoints -= task.points;
                                indexToDelete = tasksCompletedArray.indexOf(task);
                                let removed = result.tasksCompleted.splice(indexToDelete, 1);
                                result.markModified('tasksCompleted');
                                result.markModified('totalPoints');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        res.redirect(`/profile/deleteGameTaskGrad/${id}/${task.task}/${redirect}`);
                                    }
                                })
                            };
                        });
                    };
                } else {
                    return err;
                };
            });
        } else {
            res.render('pages/login', {message: `You must be logged in to delete a task.`, user: undefined});
        };
    },

    deleteTaskGrad: (req, res) => {
        if(req.isAuthenticated()) {
            let { id } = req.params;
            let { task } = req.params;
            let { redirect } = req.params;
            let gradsCompletedArray;
            let indexToDelete;
            GameTask.findOne({task: task}, function(err, result) {
                if(!err) {
                    if(!result) {
                        let message = `Try again. There was some difficulty in deleting that task.`
                        if (redirect === 'profile') {
                            res.redirect(`/profile/page/${message}`);
                        } else if (redirect === 'game') {
                            res.redirect(`/home/${message}`);
                        };
                    } else {
                        gradsCompletedArray = result.graduatesCompleted;
                        gradsCompletedArray.forEach(entry => {
                            if(id == entry._id) {
                                indexToDelete = gradsCompletedArray.indexOf(entry);
                                let removed = result.graduatesCompleted.splice(indexToDelete, 1);
                                result.markModified('graduatesCompleted');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        let message = `The task has been deleted!`;
                                        if (redirect === 'profile') {
                                            res.redirect(`/profile/page/${message}`);
                                        } else if (redirect === 'game') {
                                            res.redirect(`/home/${message}`);
                                        };   
                                    }
                                })
                            };
                        });
                    };
                } else {
                    return err;
                }
            });
        } else {
            res.render('pages/login', {message: `You must be logged in to delete a task.`, user: undefined});
        }
    }

};