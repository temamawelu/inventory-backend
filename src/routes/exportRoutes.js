const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Note: Authentication is handled inside the controller (token can be in header or query string)
// This allows file downloads with token in URL

router.get('/products', exportController.exportProductsToExcel);
router.get('/transactions', exportController.exportTransactionsToExcel);
router.get('/low-stock', exportController.exportLowStockToExcel);

module.exports = router;
