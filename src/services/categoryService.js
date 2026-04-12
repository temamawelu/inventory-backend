const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    async createCategory(name, description) {
        if (!name || name.trim() === '') {
            throw new Error('Category name is required');
        }

        const existing = await categoryRepository.findByName(name);
        if (existing) {
            throw new Error('Category name already exists');
        }

        const categoryId = await categoryRepository.create(name, description);
        return { id: categoryId, name };
    }

    async updateCategory(id, name, description) {
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new Error('Category not found');
        }

        const nameExists = await categoryRepository.findByName(name);
        if (nameExists && nameExists.id !== parseInt(id)) {
            throw new Error('Category name already exists');
        }

        const affected = await categoryRepository.update(id, name, description);
        return affected > 0;
    }

    async deleteCategory(id) {
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new Error('Category not found');
        }

        const affected = await categoryRepository.softDelete(id);
        return affected > 0;
    }

    async searchCategories(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return await this.getAllCategories();
        }
        return await categoryRepository.search(searchTerm);
    }
}

module.exports = new CategoryService();
