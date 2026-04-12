const pool = require('../config/database');

class ProductRepository {
    async findAll() {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC';
                       
        const [rows] = await pool.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    async findBySku(sku) {
        const query = 'SELECT id FROM products WHERE sku = ?';
        const [rows] = await pool.query(query, [sku]);
        return rows[0];
    }

    async create(productData) {
        const query = 'INSERT INTO products (sku, name, description, category_id, unit_price, quantity_on_hand, reorder_point, location, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, productData);
        return result.insertId;
    }

    async update(id, productData) {
        const query = 'UPDATE products SET name = ?, description = ?, category_id = ?, unit_price = ?,  reorder_point = ?, location = ?, updated_at = NOW() WHERE id = ?';   
        const [result] = await pool.query(query, [...productData, id]);
        return result.affectedRows;
    }

    async softDelete(id) {
        const query = 'UPDATE products SET is_active = 0 WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }

    async search(searchTerm) {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?) ORDER BY p.created_at DESC';
                   
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await pool.query(query, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }

    async getLowStock() {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.quantity_on_hand <= p.reorder_point ORDER BY p.quantity_on_hand ASC';
                      
        const [rows] = await pool.query(query);
        return rows;
    }

    async updateStock(id, newQuantity) {
        const query = 'UPDATE products SET quantity_on_hand = ?, updated_at = NOW() WHERE id = ?';
        await pool.query(query, [newQuantity, id]);
    }

    async getCurrentStock(id) {
        const query = 'SELECT quantity_on_hand FROM products WHERE id = ? FOR UPDATE';
        const [rows] = await pool.query(query, [id]);
        return rows[0]?.quantity_on_hand || 0;
    }
}

module.exports = new ProductRepository();
