const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, searchSuppliers } = require('../controllers/supplierController');

router.use(protect);

router.get('/search', searchSuppliers);
router.route('/').get(getAllSuppliers).post(createSupplier);
router.route('/:id').get(getSupplierById).put(updateSupplier).delete(deleteSupplier);

module.exports = router;
