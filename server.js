const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

global.db = pool;

const testDb = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL Database connected');
        conn.release();
    } catch (err) {
        console.log('❌ Database connection failed:', err.message);
    }
};
testDb();

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');
const profileRoutes = require('./src/routes/profileRoutes');  // ✅ Make sure this exists
const supplierRoutes = require('./src/routes/supplierRoutes');
const exportRoutes = require('./src/routes/exportRoutes');

// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);  // ✅ Make sure this is registered
app.use('/api/suppliers', supplierRoutes);
app.use('/api/export', exportRoutes);

// ============================================
// DASHBOARD ENDPOINT
// ============================================
app.get('/api/dashboard', async (req, res) => {
    try {
        const [totalProducts] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
        const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND quantity_on_hand <= reorder_point');
        const [todayTransactions] = await pool.query("SELECT COUNT(*) as count FROM inventory_transactions WHERE DATE(created_at) = CURDATE()");
        const [stockValue] = await pool.query('SELECT SUM(quantity_on_hand * unit_price) as total FROM products WHERE is_active = 1');
        
        res.json({
            success: true,
            data: {
                total_products: totalProducts[0].count,
                low_stock_alerts: lowStock[0].count,
                today_transactions: todayTransactions[0].count,
                total_inventory_value: stockValue[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Web Based Inventory Management System API',
        version: '3.0.0',
        endpoints: {
            auth: '/api/auth',
            categories: '/api/categories',
            products: '/api/products',
            transactions: '/api/transactions',
            suppliers: '/api/suppliers',
            dashboard: '/api/dashboard',
            users: '/api/users',
            profile: '/api/profile',
            export: '/api/export'
        }
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('🚀 Server running on http://localhost:' + PORT);
});
