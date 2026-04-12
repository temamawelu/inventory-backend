const pool = require('../config/database');

class SupplierRepository {
    async findAll() {
        const query = 'SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC';
        const [rows] = await pool.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM suppliers WHERE id = ? AND is_active = 1';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    async findByName(name) {
        const query = 'SELECT id FROM suppliers WHERE name = ? AND is_active = 1';
        const [rows] = await pool.query(query, [name]);
        return rows[0];
    }

    async create(supplierData) {
        const query = 'INSERT INTO suppliers (name, contact_name, email, phone, address, tax_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, supplierData);
        return result.insertId;
    }

    async update(id, supplierData) {
        const query = 'UPDATE suppliers SET name = ?, contact_name = ?, email = ?, phone = ?, address = ?, tax_id = ?, notes = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [...supplierData, id]);
        return result.affectedRows;
    }

    async softDelete(id) {
        const query = 'UPDATE suppliers SET is_active = 0, deleted_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }

    async search(searchTerm) {
        const query = 'SELECT * FROM suppliers WHERE is_active = 1 AND (name LIKE ? OR contact_name LIKE ? OR email LIKE ?) ORDER BY name ASC';
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await pool.query(query, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }
}

module.exports = new SupplierRepository();
