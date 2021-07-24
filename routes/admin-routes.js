const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');

// route for /admin
router.route('/')
    .get(adminController.admin)

router.route('/graduatesList')
    .get(adminController.graduatesList)

router.route('/createGraduate')
    .get(adminController.createGraduatePage)
    .post(adminController.createGraduate)

router.route('/graduateEdit/:id')
    .get(adminController.editGraduate)
    .put(adminController.updateGraduate)

router.route('/gameTasksList')
    .get(adminController.gameTasksList)

router.route('/createGameTask')
    .get(adminController.createGameTaskPage)
    .post(adminController.createGameTask)

router.route('/gameTaskEdit/:id')
    .get(adminController.editGameTask)
    .put(adminController.updateGameTask)




module.exports = router;