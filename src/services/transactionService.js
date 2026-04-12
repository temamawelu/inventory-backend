const pool = require('../config/database');

class TransactionService {
    async recordGoodsReceipt(productId, userId, quantity, referenceNumber, notes) {
        if (!productId || !quantity || quantity <= 0) {
            throw new Error('Product ID and valid quantity required');
        }

        const [result] = await pool.query(
            'CALL AddInventoryTransaction(?, ?, 1, ?, ?, ?)',
            [productId, userId, quantity, referenceNumber || null, notes || null]
        );

        const newQuantity = result[0]?.[0]?.new_quantity;

        return {
            product_id: productId,
            quantity_added: quantity,
            new_quantity: newQuantity
        };
    }

    async recordGoodsIssue(productId, userId, quantity, referenceNumber, notes) {
        if (!productId || !quantity || quantity <= 0) {
            throw new Error('Product ID and valid quantity required');
        }

        const [result] = await pool.query(
            'CALL AddInventoryTransaction(?, ?, 2, ?, ?, ?)',
            [productId, userId, quantity, referenceNumber || null, notes || null]
        );

        const newQuantity = result[0]?.[0]?.new_quantity;

        return {
            product_id: productId,
            quantity_removed: quantity,
            new_quantity: newQuantity
        };
    }

    async getTransactionHistory(productId = null, limit = 100) {
        let query = 'SELECT it.*, p.name as product_name, p.sku, tt.name as transaction_type_name, u.username as user_name FROM inventory_transactions it JOIN products p ON it.product_id = p.id JOIN transaction_types tt ON it.transaction_type_id = tt.id JOIN users u ON it.user_id = u.id';
        const params = [];

        if (productId) {
            query += ' WHERE it.product_id = ?';
            params.push(productId);
        }

        query += ' ORDER BY it.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [rows] = await pool.query(query, params);
        return rows;
    }
}

module.exports = new TransactionService();
