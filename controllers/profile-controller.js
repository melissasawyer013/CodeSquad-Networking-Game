const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');
const Score = require('../models/scoreSchema');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;
const authenticationInfo = require('../config/authorization');

module.exports = {
    profile: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/profile', { user: req.user, message: undefined, completedTasks: req.user.tasksCompleted });    
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
            let matchingId = new ObjectId();
            GameTask.findByIdAndUpdate(id, {$push: {
                graduatesCompleted: {
                    '_id': matchingId,
                    'name': req.user.name,
                    'dateAdded': new Date(),
                    'dateEdited': new Date(),
                    'dateCompleted': req.body.dateCompleted,
                }
            }}, {new: true}, err => {
                if (err) {
                    return err;
                } else {
                    res.redirect(`/profile/updateGraduateTask/${id}/${req.body.dateCompleted}/${matchingId}`);
                }
            })
        }
    },

    //6101dc86d1b96fab693ce79f
    //6101dc86d1b96fab693ce79f

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
                            res.redirect('/')
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
            Graduate.findByIdAndUpdate(id, {$set: {
                name: req.body.name,
                email: req.body.email,
                linkedinUrl: req.body.linkedinUrl,
            }}, { new: true }, err => {
                if(err) {
                    return err;
                } else {
                    res.redirect(`/profile`);
                };
            })
        } else {
            res.render('pages/login', {message: `You must be logged in to edit your profile.`, user: undefined})
        }
    },

    updateTaskDate: (req, res) => {
        if(req.isAuthenticated()) {
            let { id } = req.params;
            let tasksCompletedArray = req.user.tasksCompleted;
            let indexToChange;
            //used this method instead of findByIdAndUpdate because could not get $set to update subdocuments. 
            Graduate.findById(req.user._id, function(err, result) {
                if(!err) {
                    if(!result){
                        console.log('no result found')
                        res.redirect('/profile')
                    } else {
                        tasksCompletedArray.forEach(task => {
                            if(id == task._id) {
                                indexToChange = tasksCompletedArray.indexOf(task);

// Should eventually add in check to make sure task isn't being changed to a date that already has an entry if the maxValue: 'daily'

                                result.tasksCompleted[indexToChange].dateCompleted = req.body.dateCompleted;
                                result.markModified('tasksCompleted');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        res.redirect(`/profile/updateGameTaskGradDate/${id}/${req.body.dateCompleted}/${result.tasksCompleted[indexToChange].task}`)
                                    }
                                })  
                            };
                        })  
                    };
                } else {
                    return err;
                }
            })
        }
    },

    updateGameTaskGradDate: (req, res) => {
        let { id } = req.params;
        let { date } = req.params;
        let { task } = req.params
        if(req.isAuthenticated()) {

            let gradsCompletedArray;
            let indexToChange;
    
            GameTask.findOne({task: task}, function(err, result) {
                if(!err) {
                    if(!result){
                        console.log('no result found')
                        res.redirect('/profile')
                    } else {
                        gradsCompletedArray = result.graduatesCompleted;
                        gradsCompletedArray.forEach(entry => {
                            if(id == entry._id) {
                                indexToChange = gradsCompletedArray.indexOf(entry);
                                result.graduatesCompleted[indexToChange].dateCompleted = date;
                                result.markModified('graduatesCompleted');
                                result.save(function(saveErr, saveResult) {
                                    if(saveErr) {
                                        return saveErr;
                                    } else {
                                        res.redirect('/profile')
                                    }
                                })  
                            };
                        })  
                    };
                } else {
                    return err;
                }
            })

        } else {
            res.render('pages/login', {message: `You must be logged in to edit this date.`, user: undefined})
        }

    }






    // updateTaskDate: (req, res) => {
    //     if(req.isAuthenticated()) {
    //         let { id } = req.params;
    //         console.log(id)
    //         Graduate.find({
    //             _id: req.user._id,
    //         }, function(err, found) {
    //             if(err) {
    //                 return err
    //             } else {
    //                 console.log(typeof found);
    //                 console.log(found._id);
    //                 res.redirect(`/profile`);
    //             }
    //         })
    //     } else {
    //         res.render('pages/login', {message: `You must be logged in to update your completed task`, user: undefined})
    //     }
    // },

    // updateTaskDate: (req, res) => {
    //     if(req.isAuthenticated()) {
    //         let { id } = req.params.id;
    //         Graduate.findOneAndUpdate({
    //             _id: req.user._id,
    //             "tasksCompleted._id": id
    //         }, {
    //             "tasksCompleted.$.dateCompleted": req.body.dateCompleted
    //         }, (err) => {
    //             if(err) {
    //                 return err;
    //             } else {
    //                 res.redirect(`/profile`);
    //             };
    //         })
    //     } else {
    //         res.render('pages/login', {message: `You must be logged in to update your completed task`, user: undefined})
    //     }
    // },

    // updateTaskDate: (req, res) => {
    //     if(req.isAuthenticated()) {
    //         let { id } = req.params.id;
    //         Graduate.findOneAndUpdate({
    //             _id: req.user._id,
    //             "tasksCompleted._id": id
    //         }, {
    //             $set: {
    //                 "tasksCompleted.$.dateCompleted": req.body.dateCompleted
    //             }
    //         }, (err) => {
    //             if(err) {
    //                 return error
    //             } else {
    //                 res.redirect(`/profile`);
    //             }

    //         })
    //     } else {
    //         res.render('pages/login', {message: `You must be logged in to update your completed task`, user: undefined})
    //     }
    // },

    // updateTaskDate: (req, res) => {
    //     if(req.isAuthenticated()) {
    //         const { id } = req.params;
    //         const userId = req.user._id;
    //         console.log(`the task's id is ${id}`);
    //         let updatedDate = req.body.dateCompleted;
    //         console.log(`the updated date is ${updatedDate}`);
    //         console.log(`do task's id and the object id in database match? ${id == req.user.tasksCompleted[0]._id}`)
    //         let tasksCompletedArray = req.user.tasksCompleted;
    //         Graduate.findOneAndUpdate(
    //             { _id: userId }, 
    //             { $set: { "tasksCompleted.$[el].dateCompleted": updatedDate }},
    //             { 
    //                 arrayFilters: [{ "el._id": id}],
    //                 new: true
    //             }, (err) => {
    //                 if(err) {
    //                     return err;
    //                 } else {
                    
    //                     res.redirect(`/profile`);

    //                 }
    //             }
    //             )


    //         // tasksCompletedArray.forEach(task => {
    //         //     if(task._id == id) {
    //         //         console.log(`Winner winner`)
    //         //         let indexToChange = tasksCompletedArray.indexOf(task);
    //         //         console.log(`the index of the task to change is: ${indexToChange}`)
    //                 // let VARIABLE = tasksCompleted[indexToChange].dateCompleted;
    //                 // Graduate.findOneAndUpdate(
    //                 //     { _id: userId }, 
    //                 //     { $set: { "tasksCompleted.$[el].dateCompleted": updatedDate }},
    //                 //     { 
    //                 //         arrayFilters: [{ "el._id": id}],
    //                 //         new: true
    //                 //     }, (err) => {
    //                 //         if(err) {
    //                 //             return err;
    //                 //         } else {
                            
    //                 //             res.redirect(`/profile`);
    
    //                 //         }
    //                 //     }
    //                 //     )
    //             // } else {
    //             //     console.log(`loops gonna loop`)
    //             // }
    //         // })
    //         // Graduate.findOneAndUpdate({
    //         //     "_id": userId,
    //         //     "tasksCompleted._id": id,
    //         // }, {
    //         //     "$set": {
    //         //         "tasksCompleted.$.dateCompleted": updatedDate
    //         //     }
    //         // }, function(err, success) {
    //         //     if(err) {
    //         //         return err;
    //         //     } else {
    //         //         console.log('about to redirect')
    //         //         res.redirect(`/profile`);
    //         //     }
    //         // })
    //         // console.log(tasksCompletedArray[0]._id);
    //         // console.log(ObjectId(tasksCompletedArray[0]._id) == ObjectId(taskId));

    //         // tasksCompletedArray.forEach(task => {
    //         //     console.log(`task._id: ${task._id}`)
    //         //     if (taskId == task._id) {
    //         //         console.log(`Yay, a match`);
    //         //         let removeIndex = tasksCompletedArray.indexOf(task);
    //         //         indexToChange = removeIndex;
    //         //         console.log(`looped through to find this idex to change: ${removeIndex}`);
    //         //         res.redirect(`/profile/updatedTaskDate/${indexToChange}`)

    //                 // Graduate.findByIdAndUpdate(req.user._id, {$set: {
    //                 //     tasksCompletedArray[indexToChange].dateCompleted: updatedDate,
    //                 // }}, { new: true}, err => {
    //                 //     if(err) {
    //                 //         return err;
    //                 //     } else {
    //                 //         console.log(`found graduate and tried to update`)
    //                 //         res.redirect(`/profile`)
    //                 //     }
    //                 // })
    //             // };
            
    //     } else {
    //         res.render('pages/login', {message: `You must be logged in to update your completed task`, user: undefined})
    //     }
    // },
};