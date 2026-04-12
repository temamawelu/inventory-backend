const supplierService = require('../services/supplierService');

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);
        res.json({ success: true, data: supplier });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const createSupplier = async (req, res) => {
    try {
        const result = await supplierService.createSupplier(req.body);
        res.status(201).json({ success: true, message: 'Supplier created', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        await supplierService.updateSupplier(req.params.id, req.body);
        res.json({ success: true, message: 'Supplier updated' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        await supplierService.deleteSupplier(req.params.id);
        res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const searchSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.searchSuppliers(req.query.q);
        res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, searchSuppliers };
