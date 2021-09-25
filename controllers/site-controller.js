const GameTask = require('../models/gameTaskSchema');

module.exports = {
    indexAddMessage: (req, res) => {
        let message = `none`;
        res.redirect(`/home/${message}`);
    },

    index: (req, res) => {
        let { message } = req.params;
        if(req.isAuthenticated()) {
            // let message = undefined;
            // creats a variable called today that gets the value for today's date from the date Object and formats it as a string: "YYYY-MM-DD"
            let date = new Date;
            let today = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, 0) + '-' + date.getDate().toString().padStart(2, 0);

            //creates an empty array called tasksCompletedToday to be passed into the ejs file and displayed after tasks that can be done today
            let tasksCompletedToday = [];

            //Creates an array where each item is an object that contains one game task from gametask database entries
            GameTask.find({}, (err, gameList) => {
                if(err) {
                    return err;
                } else {
                    //creates an array called tasksCompletedAllTime to be passed into the ejs file and displayed at the bottom of the page
                    let tasksCompletedAllTime = req.user.tasksCompleted;
                    
                    // creates an array of all the tasks in gametask database entries to be pruned further down, with the final list passed into the ejs file to be shown as regular game task options users can complete at the time the page is rendered
                    let tasksCanAddToday = gameList;

                    // for each of the completed tasks in the tasksCompletedAllTime list, 
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
                    res.render('pages/index', {user: req.user,  tasksCompletedAllTime: tasksCompletedAllTime, tasksCompletedToday: tasksCompletedToday, tasksCanAddToday: tasksCanAddToday, message: message})
                }
            })
        } else {
            res.render('pages/index', {user: undefined, message: message});
        }
    },

    about: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/about', {user: req.user})
        } else {
            res.render('pages/about', {user: undefined})
        };
    },

    resources: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/resources', { user: req.user });    
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined })
        };
    },
};