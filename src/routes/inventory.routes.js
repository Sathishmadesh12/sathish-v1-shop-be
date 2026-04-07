const router = require('express').Router();
const { inventory } = require('../controllers/index');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
router.get('/', protect, roleGuard('admin'), inventory.getAll);
router.get('/item/:itemId', protect, roleGuard('admin'), inventory.getByItem);
router.post('/adjust', protect, roleGuard('admin'), inventory.adjust);
module.exports = router;
