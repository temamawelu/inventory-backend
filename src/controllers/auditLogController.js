const auditLogRepository = require('../repositories/auditLogRepository');

const getAuditLogs = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        const logs = await auditLogRepository.getLogs(parseInt(limit), parseInt(offset));
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAuditLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;
        const logs = await auditLogRepository.getLogsByUser(userId, parseInt(limit));
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAuditLogsByAction = async (req, res) => {
    try {
        const { action } = req.params;
        const { limit = 50 } = req.query;
        const logs = await auditLogRepository.getLogsByAction(action, parseInt(limit));
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAuditLogs, getAuditLogsByUser, getAuditLogsByAction };
