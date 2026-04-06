const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.put('/change-password', protect, ctrl.changePassword);
router.get('/me', protect, ctrl.getMe);
router.put('/me', protect, ctrl.updateProfile);

module.exports = router;
