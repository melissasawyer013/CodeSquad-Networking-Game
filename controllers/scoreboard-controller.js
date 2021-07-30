const Graduate = require('../models/graduateSchema');
const GameTask = require('../models/gameTaskSchema');

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
                    console.log(`current month: ${currentMonth}`);
                    sortedGradsAllTime.forEach(grad => {
                        // let monthlyPoints = grad.totalPoints;
                        let tasksCompletedArray = grad.tasksCompleted;
                        let monthlyPoints = 0;
                        tasksCompletedArray.forEach(task => {
                            let taskMonth = task.dateCompleted.substr(5, 2);
                            // console.log(`the task with id ${task._id}'s taskMonth: ${taskMonth}`);
                            if (taskMonth === currentMonth) {
                                monthlyPoints += task.points;
                                // console.log(`new monthly points total: ${monthlyPoints}`);
                            }  
                        });
                        let objectToAdd = {
                            name: grad.name,
                            monthlyPoints: monthlyPoints,
                            cohortYear: grad.cohortYear,
                            photoUrl: grad.photoUrl
                        };
                        // console.log(`objectToAdd: ${objectToAdd}`);
                        sortedGradsMonth.push(objectToAdd);
                    });
                    // sortedGradsMonth.sort((a, b) => (a.monthlyPoints > b.monthlyPoints ?1 : a.monthlyPoints === b.monthlyPoints) ? ((a.cohortYear < b.cohortYear) ? 1 : -1) : -1);
                    sortedGradsMonth.sort((a, b) => parseFloat(b.monthlyPoints) - parseFloat(a.monthlyPoints));
                    // console.log(`newly sorted sortedGradsMonth: ${sortedGradsMonth}`);
                    res.render('pages/scoreboard', {user: req.user, sortedGradsAllTime: sortedGradsAllTime, sortedGradsMonth: sortedGradsMonth 
                    })
                }
            });          
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined} )
        }  
    },

    // scoreboardMonth: (req, res) => {
    //     if(req.isAuthenticated()) {
    //         let { sortedGradsAllTime } = req.params;
    //         let sortedGradsMonth = [];
    //         let date = new Date;
    //         let today = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, 0) + '-' + date.getDate().toString().padStart(2, 0);
    //         let currentMonth = today.substr(5, 2);
    //         console.log(`current month: ${currentMonth}`);
    //         sortedGradsAllTime.forEach(grad => {
    //             // let monthlyPoints = grad.totalPoints;
    //             let tasksCompletedArray = grad.tasksCompleted;
    //             let monthlyPoints = 0;
    //             tasksCompletedArray.forEach(task => {
    //                 let taskMonth = task.dateCompleted.substr(5, 2);
    //                 console.log(`the task with id ${task._id}'s taskMonth: ${taskMonth}`);
    //                 if (taskMonth === currentMonth) {
    //                     monthlyPoints += task.points;
    //                     console.log(`new monthly points total: ${montlyPoints}`);
    //                 }
    //             })
    //         });
    //         res.render('pages/scoreboard', {user: req.user, sortedGradsAllTime: sortedGradsAllTime, 
    //         })
    //     } else {
    //         res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined} )
    //     }
    // },


};