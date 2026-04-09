const pool = require('../config/database');

const goodsReceipt = async (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Product ID and valid quantity required' });
    }

    try {
        await pool.query('CALL AddInventoryTransaction(?, ?, 1, ?, ?, ?)', [product_id, req.user.id, quantity, reference_number || null, notes || null]);

        res.json({ success: true, message: 'Goods receipt recorded', data: { product_id: product_id, quantity_added: quantity } });
    } catch (error) {
        console.error('Goods receipt error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const goodsIssue = async (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Product ID and valid quantity required' });
    }

    try {
        await pool.query('CALL AddInventoryTransaction(?, ?, 2, ?, ?, ?)', [product_id, req.user.id, quantity, reference_number || null, notes || null]);

        res.json({ success: true, message: 'Goods issue recorded', data: { product_id: product_id, quantity_removed: quantity } });
    } catch (error) {
        console.error('Goods issue error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getHistory = async (req, res) => {
    const { product_id, limit = 100 } = req.query;

    try {
        let query = 'SELECT it.*, p.name as product_name, p.sku, tt.name as transaction_type_name, u.username as user_name FROM inventory_transactions it JOIN products p ON it.product_id = p.id JOIN transaction_types tt ON it.transaction_type_id = tt.id JOIN users u ON it.user_id = u.id';
        const params = [];

        if (product_id) {
            query = query + ' WHERE it.product_id = ?';
            params.push(product_id);
        }

        query = query + ' ORDER BY it.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [rows] = await pool.query(query, params);
        
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { goodsReceipt, goodsIssue, getHistory };
