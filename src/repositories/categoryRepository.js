const pool = require('../config/database');

class CategoryRepository {
    async findAll() {
        const query = 'SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC';
        const [rows] = await pool.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = ? AND is_active = 1';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    async findByName(name) {
        const query = 'SELECT id FROM categories WHERE name = ? AND is_active = 1';
        const [rows] = await pool.query(query, [name]);
        return rows[0];
    }

    async create(name, description) {
        const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
        const [result] = await pool.query(query, [name, description || null]);
        return result.insertId;
    }

    async update(id, name, description) {
        const query = 'UPDATE categories SET name = ?, description = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [name, description || null, id]);
        return result.affectedRows;
    }

    async softDelete(id) {
        const query = 'UPDATE categories SET is_active = 0 WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }

    async search(searchTerm) {
        const query = 'SELECT * FROM categories WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?) ORDER BY name ASC';
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await pool.query(query, [searchPattern, searchPattern]);
        return rows;
    }
}

module.exports = new CategoryRepository();
