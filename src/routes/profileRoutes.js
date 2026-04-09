const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, updatePassword } = require('../controllers/profileController');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);

module.exports = router;