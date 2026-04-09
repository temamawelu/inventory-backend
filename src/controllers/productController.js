const pool = require('../config/database');

const getAllProducts = async (req, res) => {
    try {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.deleted_at IS NULL ORDER BY p.created_at DESC';
        const [products] = await pool.query(query);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1 AND p.deleted_at IS NULL';
        const [products] = await pool.query(query, [req.params.id]);
        
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: products[0] });
    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProduct = async (req, res) => {
    const { sku, name, description, category_id, unit_price, quantity_on_hand, reorder_point, location } = req.body;

    if (!sku || !name || !unit_price) {
        return res.status(400).json({ success: false, message: 'SKU, Name and Unit Price are required' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'SKU already exists' });
        }

        const insertQuery = 'INSERT INTO products (sku, name, description, category_id, unit_price, quantity_on_hand, reorder_point, location, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(insertQuery, [sku, name, description || null, category_id || null, unit_price, quantity_on_hand || 0, reorder_point || 0, location || null, req.user.id]);

        res.status(201).json({ success: true, message: 'Product created', data: { id: result.insertId, sku, name } });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    const { name, description, category_id, unit_price, reorder_point, location } = req.body;

    try {
        const [products] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updateQuery = 'UPDATE products SET name = ?, description = ?, category_id = ?, unit_price = ?, reorder_point = ?, location = ?, updated_at = NOW() WHERE id = ?';
        await pool.query(updateQuery, [name, description || null, category_id || null, unit_price, reorder_point || 0, location || null, req.params.id]);

        res.json({ success: true, message: 'Product updated' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await pool.query('UPDATE products SET is_active = 0, deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const searchProducts = async (req, res) => {
    const { q } = req.query;

    try {
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.deleted_at IS NULL';
        let params = [];

        if (q && q.trim()) {
            query = query + ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
            const searchTerm = '%' + q + '%';
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query = query + ' ORDER BY p.created_at DESC';
        
        const [products] = await pool.query(query, params);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLowStock = async (req, res) => {
    try {
        const query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.deleted_at IS NULL AND p.quantity_on_hand <= p.reorder_point ORDER BY p.quantity_on_hand ASC';
        const [products] = await pool.query(query);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts, getLowStock };
