module.exports = {
    scoreboard: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/scoreboard')
        } else {
            res.render('pages/login', { message: `You need to be logged in to access this page. Please login now.`, user: undefined} )
        }  
    },
};