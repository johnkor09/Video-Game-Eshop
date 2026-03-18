const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken } = require('../middleware/auth'); //To account tou order

router.get('/content', authenticateToken, OrderController.GetOrder);
router.post('/new', authenticateToken, OrderController.CreateOrder);

module.exports = router;