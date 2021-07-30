const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');

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
                console.log(`newGraduate: ${newGraduate}`);
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
                        res.render('pages/admin-graduate-edit', {foundGraduate: foundGraduate, user: req.user});
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
                console.log(`newGameTask: ${newGameTask}`);
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

};