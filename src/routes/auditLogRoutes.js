const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAuditLogs, getAuditLogsByUser, getAuditLogsByAction } = require('../controllers/auditLogController');

// Only admin can view audit logs
router.use(protect);
router.use(adminOnly);

router.get('/', getAuditLogs);
router.get('/user/:userId', getAuditLogsByUser);
router.get('/action/:action', getAuditLogsByAction);

module.exports = router;
