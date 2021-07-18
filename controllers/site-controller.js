module.exports = {
    index: (req, res) => {
        res.render('pages/index')
    },

    about: (req, res) => {
        res.render('pages/about')
    },

    resources: (req, res) => {
        res.render('pages/resources');
    }

};