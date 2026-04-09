const userService = require('../services/userService');

const getProfile = async (req, res) => {
    try {
        const profile = await userService.getProfile(req.user.id);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { full_name, phone } = req.body;

    try {
        const updatedProfile = await userService.updateProfile(req.user.id, full_name, phone);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updatePassword = async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Current password and new password required' 
        });
    }

    if (new_password.length < 4) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 4 characters' 
        });
    }

    try {
        await userService.updatePassword(req.user.id, current_password, new_password);
        res.json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getProfile, updateProfile, updatePassword };