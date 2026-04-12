const nodemailer = require('nodemailer');

console.log('Loading email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

let transporter = null;

// Only create transporter if credentials exist
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('✅ Email transporter configured');
    } catch (error) {
        console.log('❌ Email configuration error:', error.message);
    }
} else {
    console.log('⚠️ Email credentials not set. Email features disabled.');
}

class EmailService {
    async sendTestEmail(to) {
        console.log('sendTestEmail called to:', to);
        
        if (!transporter) {
            console.log('Email transporter not configured');
            return false;
        }
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Inventory System - Email Test',
            html: '<h2>Email Configuration Test</h2><p>If you receive this, your email settings are correct!</p>'
        };
        
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Test email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Test email error:', error.message);
            return false;
        }
    }
    
    async sendLowStockAlert(product, adminEmail) {
        if (!transporter) {
            console.log('Email transporter not configured');
            return false;
        }
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: 'LOW STOCK ALERT: ' + product.name,
            html: '<h2>Low Stock Alert</h2><p>Product: ' + product.name + '</p><p>Current Stock: ' + product.quantity_on_hand + '</p><p>Reorder Point: ' + product.reorder_point + '</p>'
        };
        
        try {
            await transporter.sendMail(mailOptions);
            console.log('Low stock alert sent for:', product.name);
            return true;
        } catch (error) {
            console.error('Low stock alert error:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
