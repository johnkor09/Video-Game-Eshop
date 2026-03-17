const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAuthAndAdmin } = require('../middleware/auth');

// User routes
router.get('/profile', authenticateToken, userController.GetUserProfile);
router.put('/profile', authenticateToken, userController.UpdateUserProfile);
router.get('/my-orders', authenticateToken, userController.GetUserOrders);

// Admin route
router.get('/', checkAuthAndAdmin, userController.GetAllCustomers);

module.exports = router;