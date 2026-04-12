 
const ExcelJS = require('exceljs');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Helper function to verify token
const verifyToken = (req) => {
    const authHeader = req.headers.authorization;
    let token = authHeader?.split(' ')[1];
    
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return null;
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return decoded;
    } catch (error) {
        return null;
    }
};

class ExportController {
    async exportProductsToExcel(req, res) {
        const decoded = verifyToken(req);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'No token provided or invalid token' });
        }
        
        try {
            const [products] = await pool.query(
                `SELECT p.id, p.sku, p.name, p.description, c.name as category, 
                        p.unit_price, p.quantity_on_hand, p.reorder_point, p.location 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = 1 
                 ORDER BY p.name ASC`
            );
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Products');
            
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'SKU', key: 'sku', width: 15 },
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Description', key: 'description', width: 40 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Unit Price', key: 'unit_price', width: 15 },
                { header: 'Stock', key: 'quantity_on_hand', width: 12 },
                { header: 'Reorder Point', key: 'reorder_point', width: 15 },
                { header: 'Location', key: 'location', width: 15 }
            ];
            
            products.forEach(product => {
                worksheet.addRow(product);
            });
            
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 12 };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            headerRow.font = { color: { argb: 'FFFFFFFF' } };
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.xlsx`);
            
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async exportTransactionsToExcel(req, res) {
        const decoded = verifyToken(req);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'No token provided or invalid token' });
        }
        
        try {
            // Simple query without backticks - use regular table names
            const query = `
                SELECT 
                    it.id, 
                    p.name as product_name, 
                    tt.name as transaction_type,
                    it.quantity, 
                    it.quantity_before, 
                    it.quantity_after,
                    it.reference_number, 
                    it.notes, 
                    it.created_at,
                    u.username as user_name
                FROM inventory_transactions it 
                INNER JOIN products p ON it.product_id = p.id 
                INNER JOIN transaction_types tt ON it.transaction_type_id = tt.id
                INNER JOIN users u ON it.user_id = u.id 
                ORDER BY it.created_at DESC
            `;
            
            const [transactions] = await pool.query(query);
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transactions');
            
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Product', key: 'product_name', width: 30 },
                { header: 'Type', key: 'transaction_type', width: 15 },
                { header: 'Quantity', key: 'quantity', width: 12 },
                { header: 'Before', key: 'quantity_before', width: 12 },
                { header: 'After', key: 'quantity_after', width: 12 },
                { header: 'Reference', key: 'reference_number', width: 20 },
                { header: 'Notes', key: 'notes', width: 30 },
                { header: 'User', key: 'user_name', width: 15 },
                { header: 'Date', key: 'created_at', width: 20 }
            ];
            
            transactions.forEach(transaction => {
                worksheet.addRow(transaction);
            });
            
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 12 };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            headerRow.font = { color: { argb: 'FFFFFFFF' } };
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.xlsx`);
            
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Export error:', error);
            console.error('SQL Error:', error.sql);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async exportLowStockToExcel(req, res) {
        const decoded = verifyToken(req);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'No token provided or invalid token' });
        }
        
        try {
            const [lowStock] = await pool.query(
                `SELECT p.sku, p.name, p.quantity_on_hand, p.reorder_point, 
                        p.location, c.name as category
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = 1 AND p.quantity_on_hand <= p.reorder_point 
                 ORDER BY p.quantity_on_hand ASC`
            );
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Low Stock Products');
            
            worksheet.columns = [
                { header: 'SKU', key: 'sku', width: 15 },
                { header: 'Product', key: 'name', width: 30 },
                { header: 'Current Stock', key: 'quantity_on_hand', width: 15 },
                { header: 'Reorder Point', key: 'reorder_point', width: 15 },
                { header: 'Location', key: 'location', width: 15 },
                { header: 'Category', key: 'category', width: 20 }
            ];
            
            lowStock.forEach(product => {
                worksheet.addRow(product);
            });
            
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 12 };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
            headerRow.font = { color: { argb: 'FFFFFFFF' } };
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=low_stock_${Date.now()}.xlsx`);
            
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ExportController();