const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/content', authenticateToken, cartController.CartContent);
router.post('/add', authenticateToken, cartController.AddItemToCart);
router.put('/changeQuantity', authenticateToken, cartController.ChangeQuantity);
router.delete('/removeItem', authenticateToken, cartController.RemoveCartItem);
router.delete('/clear', authenticateToken, cartController.ClearCart);

module.exports = router;