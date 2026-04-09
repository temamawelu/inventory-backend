const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class UserService {
    async register(username, email, password, fullName = null, phone = null) {
        // Check if user exists
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (role_id = 2 for regular user)
        const userId = await userRepository.create([
            username, email, hashedPassword, 2, fullName, phone
        ]);

        // Generate token
        const token = jwt.sign(
            { id: userId, username: username, role_id: 2 },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: userId,
                username: username,
                email: email,
                full_name: fullName,
                phone: phone,
                role_id: 2,
                role_name: 'user'
            }
        };
    }

    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        await userRepository.updateLastLogin(user.id);

        const token = jwt.sign(
            { id: user.id, username: user.username, role_id: user.role_id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                role_id: user.role_id,
                role_name: user.role_id === 1 ? 'admin' : 'user'
            }
        };
    }

    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateProfile(userId, fullName, phone) {
        await userRepository.updateProfile(userId, fullName, phone);
        return await userRepository.findById(userId);
    }

    async updatePassword(userId, currentPassword, newPassword) {
        // Get current password hash
        const currentHash = await userRepository.getPasswordHash(userId);
        if (!currentHash) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, currentHash);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userRepository.updatePassword(userId, hashedPassword);
    }

    async updateAvatar(userId, avatarUrl) {
        await userRepository.updateAvatar(userId, avatarUrl);
        return avatarUrl;
    }

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

    async createUser(username, email, password, roleId, fullName = null, phone = null) {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = await userRepository.create([
            username, email, hashedPassword, roleId || 2, fullName, phone
        ]);

        return { id: userId, username, email, full_name: fullName, phone };
    }

    async updateUser(id, username, email, roleId, isActive) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        await userRepository.update(id, [username, email, roleId, isActive]);
    }

    async deleteUser(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        await userRepository.softDelete(id);
    }
}

module.exports = new UserService();