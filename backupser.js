const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware!
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

// Test database connection
const testDb = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('MySQL Database connected');
        conn.release();
    } catch (err) {
        console.log('Database connection failed:', err.message);
    }
};
testDb();

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');


// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// ============================================
// CATEGORY ENDPOINTS (Direct in server.js for now)
// ============================================
let categories = [
    { id: 1, name: 'Electronics', description: 'Electronic devices and components', created_at: new Date().toISOString() },
    { id: 2, name: 'Accessories', description: 'Peripherals and accessories', created_at: new Date().toISOString() },
    { id: 3, name: 'Furniture', description: 'Office and home furniture', created_at: new Date().toISOString() },
    { id: 4, name: 'Stationery', description: 'Office supplies and stationery', created_at: new Date().toISOString() }
];
let nextCategoryId = 5;

let products = [
    { id: 1, sku: 'PRD-001', name: 'Laptop Pro', description: 'High-performance laptop', category_id: 1, category_name: 'Electronics', unit_price: 999.99, quantity_on_hand: 25, reorder_point: 5, location: 'A1-Shelf1', created_at: new Date().toISOString() },
    { id: 2, sku: 'PRD-002', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', category_id: 2, category_name: 'Accessories', unit_price: 29.99, quantity_on_hand: 150, reorder_point: 20, location: 'B2-Shelf3', created_at: new Date().toISOString() },
    { id: 3, sku: 'PRD-003', name: 'USB-C Cable', description: '2m USB-C charging cable', category_id: 2, category_name: 'Accessories', unit_price: 12.99, quantity_on_hand: 8, reorder_point: 10, location: 'B2-Shelf4', created_at: new Date().toISOString() },
    { id: 4, sku: 'PRD-004', name: 'Office Chair', description: 'Ergonomic office chair', category_id: 3, category_name: 'Furniture', unit_price: 299.99, quantity_on_hand: 10, reorder_point: 3, location: 'C1-Shelf1', created_at: new Date().toISOString() },
    { id: 5, sku: 'PRD-005', name: 'Monitor 27"', description: '4K UHD Monitor', category_id: 1, category_name: 'Electronics', unit_price: 399.99, quantity_on_hand: 8, reorder_point: 2, location: 'A2-Shelf2', created_at: new Date().toISOString() }
];
let nextProductId = 6;

let transactions = [
    { id: 1, product_id: 1, product_name: 'Laptop Pro', transaction_type_name: 'GOODS_RECEIPT', quantity: 25, quantity_before: 0, quantity_after: 25, reference_number: 'INIT-001', notes: 'Initial stock', created_at: new Date().toISOString() },
    { id: 2, product_id: 2, product_name: 'Wireless Mouse', transaction_type_name: 'GOODS_RECEIPT', quantity: 150, quantity_before: 0, quantity_after: 150, reference_number: 'INIT-002', notes: 'Initial stock', created_at: new Date().toISOString() },
    { id: 3, product_id: 3, product_name: 'USB-C Cable', transaction_type_name: 'GOODS_RECEIPT', quantity: 200, quantity_before: 0, quantity_after: 200, reference_number: 'INIT-003', notes: 'Initial stock', created_at: new Date().toISOString() }
];
let nextTransactionId = 4;

// Categories CRUD
app.get('/api/categories', (req, res) => { res.json({ success: true, data: categories }); });
app.get('/api/categories/:id', (req, res) => {
    const category = categories.find(c => c.id === parseInt(req.params.id));
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
});
app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ success: false, message: 'Category name is required' });
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });
    const newCategory = { id: nextCategoryId++, name, description: description || '', created_at: new Date().toISOString() };
    categories.push(newCategory);
    res.status(201).json({ success: true, message: 'Category created', data: newCategory });
});
app.put('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
    const { name, description } = req.body;
    categories[index] = { ...categories[index], name: name || categories[index].name, description: description || categories[index].description, updated_at: new Date().toISOString() };
    products.forEach(p => { if (p.category_id === id) p.category_name = name; });
    res.json({ success: true, message: 'Category updated', data: categories[index] });
});
app.delete('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
    const productsInCategory = products.filter(p => p.category_id === id);
    if (productsInCategory.length > 0) return res.status(400).json({ success: false, message: 'Cannot delete category. It is used by ' + productsInCategory.length + ' product(s).' });
    categories.splice(index, 1);
    res.json({ success: true, message: 'Category deleted' });
});
app.get('/api/categories/search', (req, res) => {
    const q = req.query.q || '';
    const filtered = categories.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || (c.description && c.description.toLowerCase().includes(q.toLowerCase())));
    res.json({ success: true, data: filtered });
});

// Products CRUD
app.get('/api/products', (req, res) => { res.json({ success: true, data: products }); });
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
});
app.post('/api/products', (req, res) => {
    const { sku, name, description, category_id, unit_price, quantity_on_hand, reorder_point, location } = req.body;
    const category = categories.find(c => c.id === parseInt(category_id));
    const newProduct = { id: nextProductId++, sku, name, description: description || '', category_id: category_id ? parseInt(category_id) : null, category_name: category ? category.name : null, unit_price: parseFloat(unit_price), quantity_on_hand: parseInt(quantity_on_hand) || 0, reorder_point: parseInt(reorder_point) || 0, location: location || '', created_at: new Date().toISOString() };
    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Product created', data: { id: newProduct.id, sku, name } });
});
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    const category = categories.find(c => c.id === parseInt(req.body.category_id));
    products[index] = { ...products[index], name: req.body.name || products[index].name, description: req.body.description || products[index].description, category_id: req.body.category_id ? parseInt(req.body.category_id) : products[index].category_id, category_name: category ? category.name : products[index].category_name, unit_price: req.body.unit_price ? parseFloat(req.body.unit_price) : products[index].unit_price, reorder_point: req.body.reorder_point ? parseInt(req.body.reorder_point) : products[index].reorder_point, location: req.body.location || products[index].location, updated_at: new Date().toISOString() };
    res.json({ success: true, message: 'Product updated' });
});
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    products.splice(index, 1);
    res.json({ success: true, message: 'Product deleted' });
});
app.get('/api/products/search', (req, res) => {
    const q = req.query.q || '';
    const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()) || (p.description && p.description.toLowerCase().includes(q.toLowerCase())));
    res.json({ success: true, data: filtered });
});
app.get('/api/products/low-stock', (req, res) => {
    const lowStock = products.filter(p => p.quantity_on_hand <= p.reorder_point);
    res.json({ success: true, data: lowStock });
});

// Transactions
app.get('/api/transactions/history', (req, res) => { res.json({ success: true, data: transactions }); });
app.post('/api/transactions/receipt', (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;
    const product = products.find(p => p.id === product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const quantityBefore = product.quantity_on_hand;
    const quantityAfter = quantityBefore + parseInt(quantity);
    product.quantity_on_hand = quantityAfter;
    const newTransaction = { id: nextTransactionId++, product_id, product_name: product.name, transaction_type_name: 'GOODS_RECEIPT', quantity: parseInt(quantity), quantity_before: quantityBefore, quantity_after: quantityAfter, reference_number: reference_number || null, notes: notes || null, created_at: new Date().toISOString() };
    transactions.unshift(newTransaction);
    res.json({ success: true, message: 'Goods receipt recorded', data: { product_id, quantity_added: quantity, new_quantity: quantityAfter } });
});
app.post('/api/transactions/issue', (req, res) => {
    const { product_id, quantity, reference_number, notes } = req.body;
    const product = products.find(p => p.id === product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.quantity_on_hand < parseInt(quantity)) return res.status(400).json({ success: false, message: 'Insufficient stock' });
    const quantityBefore = product.quantity_on_hand;
    const quantityAfter = quantityBefore - parseInt(quantity);
    product.quantity_on_hand = quantityAfter;
    const newTransaction = { id: nextTransactionId++, product_id, product_name: product.name, transaction_type_name: 'GOODS_ISSUE', quantity: parseInt(quantity), quantity_before: quantityBefore, quantity_after: quantityAfter, reference_number: reference_number || null, notes: notes || null, created_at: new Date().toISOString() };
    transactions.unshift(newTransaction);
    res.json({ success: true, message: 'Goods issue recorded', data: { product_id, quantity_removed: quantity, new_quantity: quantityAfter } });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
    res.json({ success: true, data: { total_products: products.length, low_stock_alerts: products.filter(p => p.quantity_on_hand <= p.reorder_point).length, today_transactions: 0, total_inventory_value: products.reduce((sum, p) => sum + (p.unit_price * p.quantity_on_hand), 0) } });
});

// Users
app.get('/api/users', (req, res) => { res.json({ success: true, data: [{ id: 1, username: 'admin', email: 'admin@inventory.com', role_name: 'admin' }] }); });
app.post('/api/users', (req, res) => { res.json({ success: true, message: 'User created' }); });
app.put('/api/users/:id', (req, res) => { res.json({ success: true, message: 'User updated' }); });
app.delete('/api/users/:id', (req, res) => { res.json({ success: true, message: 'User deleted' }); });

// Health check
app.get('/api/health', (req, res) => { res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() }); });

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Web Based Inventory Management System API', version: '2.0.0', endpoints: { auth: '/api/auth', categories: '/api/categories', products: '/api/products', transactions: '/api/transactions', dashboard: '/api/dashboard', users: '/api/users', profile: '/api/profile' } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
