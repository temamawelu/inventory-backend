const pool = require('../config/database');

class AuditLogRepository {
    async log(userId, userEmail, action, entityType, entityId, oldData, newData, ipAddress, userAgent) {
        const query = 'INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [
            userId || null,
            userEmail || null,
            action,
            entityType,
            entityId || null,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            ipAddress || null,
            userAgent || null
        ]);
        return result.insertId;
    }

    async getLogs(limit = 100, offset = 0, filters = {}) {
        let query = 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?';
        let params = [limit, offset];
        
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async getLogsByUser(userId, limit = 50) {
        const query = 'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
        const [rows] = await pool.query(query, [userId, limit]);
        return rows;
    }

    async getLogsByAction(action, limit = 50) {
        const query = 'SELECT * FROM audit_logs WHERE action = ? ORDER BY created_at DESC LIMIT ?';
        const [rows] = await pool.query(query, [action, limit]);
        return rows;
    }
}

module.exports = new AuditLogRepository();
