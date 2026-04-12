const pool = require('../config/database');

class TransactionRepository {
    async create(transactionData) {
        const query = INSERT INTO inventory_transactions 
                       (product_id, user_id, transaction_type, quantity, quantity_before, quantity_after, reference_number, notes) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        const [result] = await pool.query(query, transactionData);
        return result.insertId;
    }

    async getHistory(productId = null, limit = 100) {
        let query = SELECT it.*, p.name as product_name, p.sku, u.username as user_name
                     FROM inventory_transactions it
                     JOIN products p ON it.product_id = p.id
                     JOIN users u ON it.user_id = u.id;
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

module.exports = new TransactionRepository();
