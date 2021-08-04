const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    admin: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                res.render('pages/admin', { user: req.user });    
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to access the admin page.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    createGraduatePage: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                res.render('pages/create-graduate', { user: req.user });    
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to create graduates.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    createGraduate: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const newGraduate = new Graduate({
                    name: req.body.name,
                    email: req.body.email,
                    cohortYear: req.body.cohortYear,
                    photoUrl: req.body.photoUrl,
                    githubUrl: req.body.githubUrl,
                    linkedinUrl: req.body.linkedinUrl,
                    totalPoints: 0,
                    tasksCompleted: [],
                    adminStatus: req.body.adminStatus,
                });
                newGraduate.save();
                res.redirect('/admin/graduatesList');    
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to create graduates.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    graduatesList: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                Graduate.find({}, (err, graduates) => {
                    if(err) {
                        return err;
                    } else {
                        res.render('pages/graduates-list', {graduates: graduates, user: req.user});
                    };
                })      
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to access the graduates list.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    editGraduate: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                Graduate.findOne({_id: id}, (err, foundGraduate) => {
                    if(err) {
                        return err;
                    } else {
                        let date = new Date;
                        let today = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, 0) + '-' + date.getDate().toString().padStart(2, 0);
                        let tasksCompletedToday = [];
                        GameTask.find({}, (err, gameList) => {
                            if(err) {
                                return err;
                            } else {
                                let tasksCompletedAllTime = foundGraduate.tasksCompleted;
                                let tasksCanAddToday = gameList;
                                tasksCompletedAllTime.forEach(completedTask => {
                                    if((completedTask.maxRate === 'once' && completedTask.dateCompleted === today) || (completedTask.maxRate === 'daily' && completedTask.dateCompleted === today)) {
                                        //tasks that were done today and can only be done once or done daily, the task will be removed from the tasksCanAddToday array because users cannot complete them again today but they are added to the tasksCompletedToday array so that they can be displayed with a line through the task text, without the add button, and text to say the date completed
                                        tasksCompletedToday.push(completedTask);  
                                        tasksCanAddToday.forEach(task => {
                                            if(task.task === completedTask.task) {
                                                let removeIndex = tasksCanAddToday.indexOf(task);
                                                if(removeIndex >= 0) {
                                                    let removed = tasksCanAddToday.splice(removeIndex, 1);
                                                };
                                            };
                                        });
                                    } else if (completedTask.maxRate === 'once' && completedTask.dateCompleted != today) {
                                        //tasks that can only be done once and weren't completed today, the task will be removed from the tasksCanAddToday array and not displayed on the ejs page because users cannot complete them
                                        tasksCanAddToday.forEach(task => {
                                            if(task.task === completedTask.task) {
                                                let removeIndex = tasksCanAddToday.indexOf(task);
                                                if(removeIndex >= 0) {
                                                    let removed = tasksCanAddToday.splice(removeIndex, 1);
                                                };
                                            };
                                        }); 
                                    };
                                });
                                res.render('pages/admin-graduate-edit', {foundGraduate: foundGraduate, user: req.user, tasksCompletedAllTime: tasksCompletedAllTime, tasksCompletedToday: tasksCompletedToday, tasksCanAddToday: tasksCanAddToday });
                            };
                        }) 
                    };
                })
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    updateGraduate: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                Graduate.findByIdAndUpdate(id, {$set: {
                    name: req.body.name,
                    email: req.body.email,
                    cohortYear: req.body.cohortYear,
                    photoUrl: req.body.photoUrl,
                    githubUrl: req.body.githubUrl,
                    linkedinUrl: req.body.linkedinUrl,
                    //total points, tasks completed, githubId, and githubProfile need added here
                    adminStatus: req.body.adminStatus,
                }}, { new: true }, err => {
                    if (err) {
                        return err;
                    } else {
                        res.redirect(`/admin/graduateEdit/${id}`);
                    };
                })
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    checkUpdateTaskDate: (req, res, err) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                let { id } = req.params;
                let { maxRate } = req.params;
                let { task } = req.params;
                let { gradId } = req.params;
                let { redirect } = req.params; 
                Graduate.findById(gradId, (error, result) => {
                    if(!error) {
                        if(!result) {
                            res.redirect(`/admin/graduateEdit/${gradId}`);
                        } else {
                            if (maxRate === 'daily') {
                                let tasksCompletedArray = result.tasksCompleted;
                                for( let i = 0; i < tasksCompletedArray.length; i++) {
                                    //for each task in tasksCompleted array in database, flag
                                    if (task === tasksCompletedArray[i].task && req.body.dateCompleted === tasksCompletedArray[i].dateCompleted) {
//Eventually have admin/gradedit accept messages and send a message that they can't change the date completed to that date because the same task has already been completed on that day, and you can only do it once per day.
                                        res.redirect(`/admin/graduateEdit/${gradId}`);
                                        return err;
                                        break;
                                    };
                                };
                                // if there are no date conflicts, routed to next step
                                if (redirect === 'admin') {
                                    res.redirect(`/admin/updateTaskDate/${id}/${req.body.dateCompleted}/${gradId}/${redirect}`);
                                } else if (redirect === 'admin new') {
                                    res.redirect(`/admin/updateGameTask/${id}/${req.body.dateCompleted}/${gradId}/${result.name}/${result.totalPoints}`)
                                }
                            } else {
                                // when the maxRate is not 'daily'
                                if (redirect === 'admin') {
                                    res.redirect(`/admin/updateTaskDate/${id}/${req.body.dateCompleted}/${gradId}/${redirect}`);
                                } else if (redirect === 'admin new') {
                                    res.redirect(`/admin/updateGameTask/${id}/${req.body.dateCompleted}/${gradId}/${result.name}/${result.totalPoints}`);
                                };
                            };
                        };
                    } else {
                        return err;
                    };
                });
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

    updateGameTaskGrad: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                const { date } = req.params;
                const { gradId } = req.params;
                const { gradName } = req.params;
                const { gradPoints } = req.params;
                let matchingId = new ObjectId();
                GameTask.findByIdAndUpdate(id, {$push: {
                    graduatesCompleted: {
                        '_id': matchingId,
                        'name': gradName,
                        'dateAdded': new Date(),
                        'dateEdited': new Date(),
                        'dateCompleted': date,
                    }
                }}, {new: true}, err => {
                    if (err) {
                        return err;
                    } else {
                        res.redirect(`/admin/updateGraduateTask/${id}/${date}/${matchingId}/${gradId}/${gradPoints}`);
                    };
                });
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

    updateGraduateTask: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                const { date } = req.params;
                const { match } = req.params;
                const { gradId } = req.params;
                const { gradPoints } = req.params;

                GameTask.findOne({_id: id}, (err, gameTask) => {
                    if(err) {
                        return err;
                    } else {
                        let gameTaskCategory = gameTask.category;
                        let gameTaskTask = gameTask.task;
                        let gameTaskPoints = gameTask.points;
                        let gameMaxRate = gameTask.maxRate;
                        let newGradPoints = parseInt(gradPoints) + gameTaskPoints;
                        Graduate.findOneAndUpdate({_id: gradId}, {
                            $set: {totalPoints: newGradPoints}, 
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
                                res.redirect(`/admin/graduateEdit/${gradId}`);
                            }
                        })
                    }
                })
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },


    updateTaskDate: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                let { id } = req.params;
                let { newDate } = req.params;
                let { gradId } = req.params;
                let { redirect } = req.params;
                let indexToChange;
                Graduate.findById(gradId, function(err, result) {
                    if(!err) {
                        if(!result){
                            res.redirect(`/admin/graduateEdit/${gradId}`);  
                        } else {
                            let tasksCompletedArray = result.tasksCompleted;
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
                                            res.redirect(`/admin/updateGameTaskGradDate/${id}/${newDate}/${result.tasksCompleted[indexToChange].task}/${gradId}/${redirect}`);
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
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

    updateGameTaskGradDate: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                let { id } = req.params;
                let { date } = req.params;
                let { task } = req.params;
                let { gradId } = req.params;
                let { redirect } = req.params;
                let gradsCompletedArray;
                let indexToChange;

                GameTask.findOne({task: task}, function(err, result) {
                    if(!err) {
                        if(!result){
                            res.redirect(`/admin/graduateEdit/${gradId}`);   
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
                                            res.redirect(`/admin/graduateEdit/${gradId}`);   
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
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

    gameTasksList: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                GameTask.find({}, (err, gameTasks) => {
                    if(err) {
                        return err;
                    } else {
                        res.render('pages/game-tasks-list', {gameTasks: gameTasks, user: req.user});
                    };
                })  
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit game tasks.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    createGameTaskPage: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                res.render('pages/create-game-task', { user: req.user });    
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to create game tasks.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    createGameTask: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const newGameTask = new GameTask ({
                    category: req.body.category,
                    task: req.body.task,
                    points: req.body.points,
                    graduatesCompleted: [],
                    maxRate: req.body.maxRate,
                });
                newGameTask.save();
                res.redirect('/admin/gameTasksList');  
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to create game tasks.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    editGameTask: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                GameTask.findOne({_id: id}, (err, foundGameTask) => {
                    if(err) {
                        return err;
                    } else {
                        res.render('pages/admin-task-edit', {foundGameTask: foundGameTask, user: req.user});
                    };
                })
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit game tasks.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    updateGameTask: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                const { id } = req.params;
                GameTask.findByIdAndUpdate(id, {$set: {
                    category: req.body.category,
                    task: req.body.task,
                    points: req.body.points,
                    maxRate: req.body.maxRate,
                }}, { new: true }, err => {
                    if (err) {
                        return err;
                    } else {
                        res.redirect(`/admin/gameTaskEdit/${id}`);
                    };
                })
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`})
            }   
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        };
    },

    deleteGradTask: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                let { id } = req.params;
                let { gradId } = req.params;
                let { redirect } = req.params;
                let indexToDelete;
                Graduate.findById(gradId, (err, result) => {
                    if(!err) {
                        if(!result) {
                            res.redirect(`/admin/graduateEdit/${gradId}`);
                        } else {
                            let tasksCompletedArray = result.tasksCompleted;
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
                                            res.redirect(`/admin/deleteGameTaskGrad/${id}/${task.task}/${gradId}`)
                                        }
                                    })
                                }
                            })
                        };
                    } else {
                        return err;
                    };
                });
            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

    deleteTaskGrad: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {
                let { id } = req.params;
                let { task } = req.params;
                let { gradId } = req.params;
                let gradsCompletedArray;
                let indexToDelete;
                GameTask.findOne({task: task}, function(err, result) {
                    if(!err) {
                        if(!result) {
                            res.redirect(`/admin/graduateEdit/${gradId}`);
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
                                            res.redirect(`/admin/graduateEdit/${gradId}`);
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
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            };
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },



    // starter route:
    callbackName: (req, res) => {
        if(req.isAuthenticated()) {
            if(req.user.adminStatus === 'Admin') {

            } else {
                res.render('pages/profile', { user: req.user, message: `You are not authorized to edit graduates.`}); 
            }
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page. Please login now.`, user: undefined })
        }
    },

};