const siteRouter = require('./site-routes');
const scoreboardRouter = require('./scoreboard-routes')
const profileRouter = require('./profile-routes');
const adminRouter = require('./admin-routes');

const router = require('express').Router();

router.use('/', siteRouter);
router.use('/scoreboard', scoreboardRouter)
router.use('/profile', profileRouter);
router.use('/admin', adminRouter)

module.exports = router;