const supplierRepository = require('../repositories/supplierRepository');

class SupplierService {
    async getAllSuppliers() {
        return await supplierRepository.findAll();
    }

    async getSupplierById(id) {
        const supplier = await supplierRepository.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }
        return supplier;
    }

    async createSupplier(supplierData) {
        const { name, contact_name, email, phone, address, tax_id, notes } = supplierData;

        if (!name || name.trim() === '') {
            throw new Error('Supplier name is required');
        }

        const existing = await supplierRepository.findByName(name);
        if (existing) {
            throw new Error('Supplier name already exists');
        }

        const supplierId = await supplierRepository.create([
            name, contact_name || null, email || null, phone || null,
            address || null, tax_id || null, notes || null
        ]);

        return { id: supplierId, name };
    }

    async updateSupplier(id, supplierData) {
        const { name, contact_name, email, phone, address, tax_id, notes } = supplierData;

        const existing = await supplierRepository.findById(id);
        if (!existing) {
            throw new Error('Supplier not found');
        }

        const affected = await supplierRepository.update(id, [
            name || existing.name,
            contact_name !== undefined ? contact_name : existing.contact_name,
            email !== undefined ? email : existing.email,
            phone !== undefined ? phone : existing.phone,
            address !== undefined ? address : existing.address,
            tax_id !== undefined ? tax_id : existing.tax_id,
            notes !== undefined ? notes : existing.notes
        ]);

        return affected > 0;
    }

    async deleteSupplier(id) {
        const existing = await supplierRepository.findById(id);
        if (!existing) {
            throw new Error('Supplier not found');
        }

        const affected = await supplierRepository.softDelete(id);
        return affected > 0;
    }

    async searchSuppliers(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return await this.getAllSuppliers();
        }
        return await supplierRepository.search(searchTerm);
    }
}

module.exports = new SupplierService();
