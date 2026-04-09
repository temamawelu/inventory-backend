const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const query = 'SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, u.is_active, u.last_login, u.created_at FROM users u JOIN roles r ON u.role_id = r.id WHERE u.deleted_at IS NULL ORDER BY u.created_at DESC';
        const [users] = await pool.query(query);
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const query = 'SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, u.is_active, u.last_login, u.created_at FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.deleted_at IS NULL';
        const [users] = await pool.query(query, [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createUser = async (req, res) => {
    const { username, email, password, role_id } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email and password required' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await pool.query('INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, role_id || 2]);

        res.status(201).json({ success: true, message: 'User created', data: { id: result.insertId, username, email } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUser = async (req, res) => {
    const { username, email, role_id, is_active } = req.body;

    try {
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await pool.query('UPDATE users SET username = ?, email = ?, role_id = ?, is_active = ?, updated_at = NOW() WHERE id = ?', [username, email, role_id, is_active, req.params.id]);
        res.json({ success: true, message: 'User updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    try {
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await pool.query('UPDATE users SET is_active = 0, deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
