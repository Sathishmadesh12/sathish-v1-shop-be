const router = require('express').Router();
const { user } = require('../controllers/index');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
router.use(protect, roleGuard('admin'));
router.get('/', user.getAll);
router.get('/:id', user.getById);
router.patch('/:id/toggle', user.toggleStatus);
module.exports = router;
