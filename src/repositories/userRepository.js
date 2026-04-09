const pool = require('../config/database');

class UserRepository {
    async findAll() {
        const query = `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role_id, r.name as role_name, 
                              u.is_active, u.last_login, u.created_at 
                       FROM users u 
                       JOIN roles r ON u.role_id = r.id 
                       WHERE u.deleted_at IS NULL 
                       ORDER BY u.created_at DESC`;
        const [rows] = await pool.query(query);
        return rows;
    }

    async findById(id) {
        const query = `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.avatar, 
                              u.role_id, r.name as role_name, u.is_active, u.last_login, u.created_at 
                       FROM users u 
                       JOIN roles r ON u.role_id = r.id 
                       WHERE u.id = ? AND u.deleted_at IS NULL`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    async findByUsername(username) {
        const query = `SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.phone, u.avatar,
                              u.role_id, r.name as role_name 
                       FROM users u 
                       JOIN roles r ON u.role_id = r.id 
                       WHERE u.username = ? AND u.is_active = 1 AND u.deleted_at IS NULL`;
        const [rows] = await pool.query(query, [username]);
        return rows[0];
    }

    async findByEmail(email) {
        const query = 'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL';
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }

    async create(userData) {
        // userData: [username, email, password_hash, role_id, full_name, phone]
        const query = `INSERT INTO users (username, email, password_hash, role_id, full_name, phone) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, userData);
        return result.insertId;
    }

    async update(id, userData) {
        // userData: [username, email, role_id, is_active]
        const query = 'UPDATE users SET username = ?, email = ?, role_id = ?, is_active = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [...userData, id]);
        return result.affectedRows;
    }

    async updateProfile(id, fullName, phone) {
        const query = 'UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [fullName || null, phone || null, id]);
        return result.affectedRows;
    }

    async updatePassword(id, hashedPassword) {
        const query = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [hashedPassword, id]);
        return result.affectedRows;
    }

    async updateAvatar(id, avatarUrl) {
        const query = 'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [avatarUrl, id]);
        return result.affectedRows;
    }

    async softDelete(id) {
        const query = 'UPDATE users SET is_active = 0, deleted_at = NOW() WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }

    async updateLastLogin(id) {
        const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        await pool.query(query, [id]);
    }

    async getPasswordHash(id) {
        const query = 'SELECT password_hash FROM users WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0]?.password_hash;
    }
}

module.exports = new UserRepository();