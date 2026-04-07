const router = require('express').Router();
const { analytics } = require('../controllers/index');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
router.get('/dashboard', protect, roleGuard('admin'), analytics.getDashboard);
router.get('/customer/summary', protect, analytics.getCustomerSummary);
module.exports = router;
