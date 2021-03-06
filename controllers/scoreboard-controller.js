const Graduate = require('../models/graduateSchema');

module.exports = {

    scoreboard: (req, res) => {
        if(req.isAuthenticated()) {
            Graduate.find({}).sort({ totalPoints: -1 }).exec(function (err, sortedGradsAllTime){
                if(err) {
                    return err;
                } else {
                    let sortedGradsMonth = [];
                    let date = new Date;
                    let today = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, 0) + '-' + date.getDate().toString().padStart(2, 0);
                    let currentMonth = today.substr(5, 2);
                    sortedGradsAllTime.forEach(grad => {
                        let tasksCompletedArray = grad.tasksCompleted;
                        let monthlyPoints = 0;
                        tasksCompletedArray.forEach(task => {
                            let taskMonth = task.dateCompleted.substr(5, 2);
                            if (taskMonth === currentMonth) {
                                monthlyPoints += task.points;
                            }  
                        });
                        let objectToAdd = {
                            name: grad.name,
                            monthlyPoints: monthlyPoints,
                            cohortYear: grad.cohortYear,
                            photoUrl: grad.photoUrl
                        };
                        sortedGradsMonth.push(objectToAdd);
                    });
                    sortedGradsMonth.sort((a, b) => parseFloat(b.monthlyPoints) - parseFloat(a.monthlyPoints));;
                    res.render('pages/scoreboard', {user: req.user, sortedGradsAllTime: sortedGradsAllTime, sortedGradsMonth: sortedGradsMonth 
                    })
                }
            });          
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined} )
        }  
    },

    lookup: (req, res) => {
        if (req.isAuthenticated() && req.user.adminStatus === 'Admin') {
            let monthToFind = req.body.scoreboardSearchMonth;
            let yearToFind = req.body.scoreboardSearchYear;
            Graduate.find({}).sort({ totalPoints:-1 }).exec(function (err, sortedGradsAllTime) {
                if(err) {
                    return err;
                } else {
                    let sortedGradsDate = [];
                    sortedGradsAllTime.forEach(grad => {
                        let tasksCompletedArray = grad.tasksCompleted;
                        let monthlyPoints = 0;
                        //copying off scoreboardLogin function... keep going. stopped on line 77
                        tasksCompletedArray.forEach(task => {
                            let taskMonth = task.dateCompleted.substr(5, 2);
                            let taskYear = task.dateCompleted.substr(0, 4);
                            if (taskMonth === monthToFind && taskYear === yearToFind) {
                                monthlyPoints += task.points;
                            }
                        });
                        let objectToAdd = {
                            name: grad.name,
                            monthlyPoints: monthlyPoints,
                            cohortYear: grad.cohortYear,
                            photoUrl: grad.photoUrl
                        };
                        sortedGradsDate.push(objectToAdd);
                        console.log(objectToAdd);
                    });
                    sortedGradsDate.sort((a, b) => parseFloat(b.monthlyPoints) - parseFloat(a.monthlyPoints));
                    res.render('pages/scoreboard-search', {
                        user: req.user,
                        sortedGradsAllTime: sortedGradsAllTime, sortedGradsDate: sortedGradsDate,
                        month: monthToFind,
                        year: yearToFind
                    });
                }
            });
        } else {
            res.render('pages/login', { message: `You need to be logged in and an admin to access this page.`, user: undefined})
        }
        

    },




};