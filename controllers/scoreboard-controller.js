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

};