const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, searchCategories } = require('../controllers/categoryController');

router.use(protect);

router.get('/search', searchCategories);
router.route('/').get(getAllCategories).post(createCategory);
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory);

module.exports = router;