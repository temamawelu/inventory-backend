const pool = require('../config/database');

class TransactionRepository {
    async createTransaction(transactionData) {
        const query = 'INSERT INTO inventory_transactions (product_id, user_id, transaction_type_id, quantity, quantity_before, quantity_after, reference_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, transactionData);
        return result.insertId;
    }

    async getHistory(productId = null, limit = 100) {
        let query = `
            SELECT it.*, p.name as product_name, p.sku, tt.name as transaction_type_name, u.username as user_name
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            JOIN transaction_types tt ON it.transaction_type_id = tt.id
            JOIN users u ON it.user_id = u.id
        `;
        const params = [];
        
        if (productId) {
            query += ' WHERE it.product_id = ?';
            params.push(productId);
        }
        
        query += ' ORDER BY it.created_at DESC LIMIT ?';
        params.push(limit);
        
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async callAddTransactionStoredProcedure(productId, userId, transactionTypeId, quantity, referenceNumber, notes) {
        const query = 'CALL AddInventoryTransaction(?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [productId, userId, transactionTypeId, quantity, referenceNumber, notes]);
        return result[0]?.[0]?.new_quantity;
    }
}

module.exports = new TransactionRepository();