const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { goodsReceipt, goodsIssue, getMovementHistory, getLowStockAlerts, getDashboardSummary } = require('../controllers/stockController');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/low-stock', getLowStockAlerts);
router.get('/movements', getMovementHistory);
router.post('/goods-receipt', goodsReceipt);
router.post('/goods-issue', goodsIssue);

module.exports = router;