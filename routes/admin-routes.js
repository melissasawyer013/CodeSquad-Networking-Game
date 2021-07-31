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

router.route('/checkUpdateTaskDate/:id/:maxRate/:task/:gradId/:redirect')
    .put(adminController.checkUpdateTaskDate)

router.route('/updateGameTask/:id/:date/:gradId/:gradName/:gradPoints')
    .get(adminController.updateGameTaskGrad)

router.route('/updateGraduateTask/:id/:date/:match/:gradId/:gradPoints')
    .get(adminController.updateGraduateTask)

router.route('/updateTaskDate/:id/:newDate/:gradId/:redirect') 
    .get(adminController.updateTaskDate)

router.route('/updateGameTaskGradDate/:id/:date/:task/:gradId/:redirect')
    .get(adminController.updateGameTaskGradDate)

router.route('/gameTasksList')
    .get(adminController.gameTasksList)

router.route('/createGameTask')
    .get(adminController.createGameTaskPage)
    .post(adminController.createGameTask)

router.route('/gameTaskEdit/:id')
    .get(adminController.editGameTask)
    .put(adminController.updateGameTask)

router.route('/deleteTask/:id/:gradId')
    .get(adminController.deleteGradTask)

router.route('/deleteGameTaskGrad/:id/:task/:gradId')
    .get(adminController.deleteTaskGrad)




module.exports = router;