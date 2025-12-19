const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

router.get('/:productId', productController.GetSpecificProduct);

module.exports = router;