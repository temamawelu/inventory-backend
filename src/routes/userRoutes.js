const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    updateUserPassword,
    getRoles,
    getTotalUsers
} = require('../controllers/userController');

// All user routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User CRUD operations
router.get('/', getAllUsers);
router.get('/total', getTotalUsers);
router.get('/roles', getRoles);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/password', updateUserPassword);
router.get('/:id', getUserById);

module.exports = router;
