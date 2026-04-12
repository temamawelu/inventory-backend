const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const result = await categoryService.createCategory(name, description);
        res.status(201).json({ success: true, message: 'Category created', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        await categoryService.updateCategory(req.params.id, name, description);
        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const searchCategories = async (req, res) => {
    try {
        const categories = await categoryService.searchCategories(req.query.q);
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, searchCategories };
