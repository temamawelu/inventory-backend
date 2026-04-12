const transactionService = require('../services/transactionService');

const goodsReceipt = async (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;

    try {
        const result = await transactionService.recordGoodsReceipt(
            product_id, req.user.id, quantity, reference_number, notes
        );
        res.json({ success: true, message: 'Goods receipt recorded', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const goodsIssue = async (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;

    try {
        const result = await transactionService.recordGoodsIssue(
            product_id, req.user.id, quantity, reference_number, notes
        );
        res.json({ success: true, message: 'Goods issue recorded', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getHistory = async (req, res) => {
    const { product_id, limit = 100 } = req.query;

    try {
        const history = await transactionService.getTransactionHistory(product_id, limit);
        res.json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { goodsReceipt, goodsIssue, getHistory };
