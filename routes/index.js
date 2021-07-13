const siteRouter = require('./site-routes');
// const adminRouter = require('./admin-routes');

const router = require('express').Router();

router.use('/', siteRouter);
// router.use('/admin', adminRouter);

module.exports = router;