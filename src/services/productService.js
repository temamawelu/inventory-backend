const productRepository = require('../repositories/productRepository');

class ProductService {
    async getAllProducts() {
        return await productRepository.findAll();
    }

    async getProductById(id) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async createProduct(productData, userId) {
        const existingSku = await productRepository.findBySku(productData.sku);
        if (existingSku) {
            throw new Error('SKU already exists');
        }

        const productId = await productRepository.create([
            productData.sku,
            productData.name,
            productData.description || null,
            productData.category_id || null,
            productData.unit_price,
            productData.quantity_on_hand || 0,
            productData.reorder_point || 0,
            productData.reorder_quantity || null,
            productData.location || null,
            userId
        ]);

        return { id: productId, sku: productData.sku, name: productData.name };
    }

    async updateProduct(id, productData) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }

        const affected = await productRepository.update(id, [
            productData.name,
            productData.description || null,
            productData.category_id || null,
            productData.unit_price,
            productData.reorder_point || 0,
            productData.reorder_quantity || null,
            productData.location || null
        ]);

        return affected > 0;
    }

    async deleteProduct(id) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }

        const affected = await productRepository.softDelete(id);
        return affected > 0;
    }

    async searchProducts(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return await this.getAllProducts();
        }
        return await productRepository.search(searchTerm);
    }

    async getLowStockProducts() {
        return await productRepository.getLowStock();
    }
}

module.exports = new ProductService();