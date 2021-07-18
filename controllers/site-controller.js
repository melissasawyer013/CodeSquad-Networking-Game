module.exports = {
    index: (req, res) => {
        if(req.isAuthenticated()) {
            res.render('pages/index', {user: req.user})
        } else {
            res.render('pages/index', {user: undefined})
        };
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