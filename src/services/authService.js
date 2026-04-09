const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
    async register(username, email, password, roleId = null) {
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
        const userRoleId = roleId || 2;

        const userId = await userRepository.create([username, email, hashedPassword, userRoleId]);

        const token = jwt.sign(
            { id: userId, username: username, role_id: userRoleId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return {
            token,
            user: { id: userId, username, email, role_id: userRoleId }
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
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name
            }
        };
    }
}

module.exports = new AuthService();