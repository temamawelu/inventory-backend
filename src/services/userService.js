const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async createUser(userData) {
        const { username, email, password, role_id, full_name, phone } = userData;

        if (!username || !email || !password) {
            throw new Error('Username, email and password are required');
        }

        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = await userRepository.create([
            username, email, hashedPassword, role_id || 2, full_name || null, phone || null
        ]);

        return { id: userId, username, email, role_id, full_name, phone };
    }

    async updateUser(id, userData) {
        const { username, email, role_id, full_name, phone, is_active } = userData;

        const existingUser = await userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        const usernameTaken = await userRepository.findByUsername(username);
        if (usernameTaken && usernameTaken.id !== parseInt(id)) {
            throw new Error('Username already taken');
        }

        const emailTaken = await userRepository.findByEmail(email);
        if (emailTaken && emailTaken.id !== parseInt(id)) {
            throw new Error('Email already taken');
        }

        const affected = await userRepository.update(id, [
            username, email, role_id, full_name || null, phone || null, is_active !== undefined ? is_active : 1
        ]);

        return affected > 0;
    }

    async updateUserPassword(id, newPassword) {
        const existingUser = await userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        if (!newPassword || newPassword.length < 4) {
            throw new Error('Password must be at least 4 characters');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const affected = await userRepository.updatePassword(id, hashedPassword);
        return affected > 0;
    }

    async deleteUser(id) {
        const existingUser = await userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        const affected = await userRepository.softDelete(id);
        return affected > 0;
    }

    async hardDeleteUser(id) {
        const existingUser = await userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        const affected = await userRepository.hardDelete(id);
        return affected > 0;
    }

    async getRoles() {
        return await userRepository.getRoles();
    }

    async getTotalUsers() {
        return await userRepository.countUsers();
    }
}

module.exports = new UserService();
