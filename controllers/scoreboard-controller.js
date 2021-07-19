module.exports = {
    scoreboard: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/scoreboard', {user: req.user})
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined} )
        }  
    },
};