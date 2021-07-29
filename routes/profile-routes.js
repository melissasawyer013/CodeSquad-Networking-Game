const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile-controller');

// route for /profile
router.route('/')
    .get(profileController.profile);

router.route('/login')
    .get(profileController.login)
    .post(profileController.checkEmail)

router.route('/auth/github')
    .get(profileController.GitHub_URI)

router.route('/auth/github/callback')
    .get(profileController.githubCallback)

router.route('/logout')
    .get(profileController.logout)

router.route('/updateGameTask/:id')
    .post(profileController.updateGameTask)

router.route('/updateGraduateTask/:id/:date/:match')
    .get(profileController.updateGraduateTask)

router.route('/editProfile/:id')
    .get(profileController.editProfile)
    .put(profileController.updateProfile)

router.route('/updateTaskDate/:id') 
    .put(profileController.updateTaskDate)

router.route('/updateGameTaskGradDate/:id/:date/:task')
    .get(profileController.updateGameTaskGradDate)


module.exports = router;