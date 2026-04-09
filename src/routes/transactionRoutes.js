const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { goodsReceipt, goodsIssue, getHistory } = require('../controllers/transactionController');

router.use(protect);

router.get('/history', getHistory);
router.post('/receipt', goodsReceipt);
router.post('/issue', goodsIssue);

module.exports = router;
