const cron = require('node-cron');
const pool = require('./src/config/database');
const emailService = require('./src/services/emailService');

// Run daily at 9:00 AM    //we change just for testing to every minute
cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running daily low stock check at:', new Date().toISOString());
    
    try {
        // Get admin email
        const [admins] = await pool.query(
            'SELECT email FROM users WHERE role_id = 1 AND is_active = 1 LIMIT 1'
        );
        
        if (admins.length === 0) {
            console.log('[Scheduler] No admin email found');
            return;
        }
        
        const adminEmail = admins[0].email;
        
        // Get low stock products
        const [lowStock] = await pool.query(
            'SELECT * FROM products WHERE is_active = 1 AND quantity_on_hand <= reorder_point'
        );
        
        if (lowStock.length > 0) {
            await emailService.sendDailyLowStockReport(lowStock, adminEmail);
            console.log('[Scheduler] Sent report for  low stock products');
        } else {
            console.log('[Scheduler] No low stock products found');
        }
    } catch (error) {
        console.error('[Scheduler] Error:', error.message);
    }
});

console.log('Email scheduler started - Daily low stock check at 9:00 AM');
