const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site-controller');

router.route('/')
    .get(siteController.index);

router.route('/about')
    .get(siteController.about);

router.route('/resources')
    .get(siteController.resources)



module.exports = router;