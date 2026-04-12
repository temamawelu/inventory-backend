const auditLogRepository = require('../repositories/auditLogRepository');

const audit = (action, entityType) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        
        // Capture the response data
        let responseBody = null;
        res.json = function(body) {
            responseBody = body;
            return originalJson.call(this, body);
        };
        
        // Store original end function
        const originalEnd = res.end;
        
        // After response is sent, log the action
        res.end = function() {
            // Only log if request was successful (status 2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user?.id;
                const userEmail = req.user?.email;
                const ipAddress = req.ip || req.connection?.remoteAddress;
                const userAgent = req.headers['user-agent'];
                
                let entityId = null;
                let oldData = null;
                let newData = null;
                
                // Extract entity ID from request params or response
                if (req.params.id) {
                    entityId = parseInt(req.params.id);
                } else if (responseBody?.data?.id) {
                    entityId = responseBody.data.id;
                }
                
                // For update/delete, capture old data if available
                if (req.oldData) {
                    oldData = req.oldData;
                }
                
                // Capture new data from request body or response
                if (req.method === 'POST' || req.method === 'PUT') {
                    newData = req.body;
                } else if (responseBody?.data) {
                    newData = responseBody.data;
                }
                
                // Log asynchronously - don't block response
                auditLogRepository.log(
                    userId, userEmail, action, entityType, entityId, 
                    oldData, newData, ipAddress, userAgent
                ).catch(err => console.error('Audit log error:', err));
            }
            
            originalEnd.call(this);
        };
        
        next();
    };
};

module.exports = { audit };
