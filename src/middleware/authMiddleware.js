const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role_id: decoded.role_id
        };
        
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role_id !== 1) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

module.exports = { protect, adminOnly };
