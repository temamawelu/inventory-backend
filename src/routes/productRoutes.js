const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts, getLowStock } = require('../controllers/productController');

router.use(protect);

router.get('/search', searchProducts);
router.get('/low-stock', getLowStock);
router.route('/').get(getAllProducts).post(createProduct);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;
