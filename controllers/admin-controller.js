const Graduate = require('../models/graduateSchema');

module.exports = {
    admin: (req, res) => {
        res.render('pages/admin')
    },

    createGraduatePage: (req, res) => {
        res.render('pages/create-graduate')
    },

    createGraduate: (req, res) => {
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
        res.redirect('/admin');
    },

    graduatesList: (req, res) => {
        Graduate.find({}, (err, graduates) => {
            if(err) {
                return err;
            } else {
                res.render('pages/graduates-list', {graduates: graduates});
            };
        })   
    },

    editGraduate: (req, res) => {
        const { id } = req.params;
        Graduate.findOne({_id: id}, (err, foundGraduate) => {
            if(err) {
                return err;
            } else {
                res.render('pages/admin-graduate-edit', {foundGraduate: foundGraduate});
            };
        })
    },

    updateGraduate: (req, res) => {
        const { id } = req.params;
        Graduate.findByIdAndUpdate(id, {$set: {
            name: req.body.name,
            email: req.body.email,
            cohortYear: req.body.cohortYear,
            photoUrl: req.body.photoUrl,
            githubUrl: req.body.githubUrl,
            linkedinUrl: req.body.linkedinUrl,
            //total points and tasks completed need added here
            adminStatus: req.body.adminStatus,
        }}, { new: true }, err => {
            if (err) {
                return err;
            } else {
                res.redirect(`/admin/graduateEdit/${id}`);
            };
        })
    },

};