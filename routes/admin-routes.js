const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');

// route for /admin
router.route('/')
    .get(adminController.admin)

// route for /admin/createGraduate
router.route('/createGraduate')
    .get(adminController.createGraduatePage)
    .post(adminController.createGraduate)

router.route('/graduatesList')
    .get(adminController.graduatesList)

router.route('/graduateEdit/:id')
    .get(adminController.editGraduate)
    .put(adminController.updateGraduate)




module.exports = router;