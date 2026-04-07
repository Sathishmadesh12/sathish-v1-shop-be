const router = require('express').Router();
const { media } = require('../controllers/index');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
router.post('/upload', protect, upload.single('file'), media.upload);
module.exports = router;
