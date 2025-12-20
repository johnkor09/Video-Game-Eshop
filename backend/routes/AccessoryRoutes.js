const express = require('express');
const router = express.Router();
const accessoryController = require('../controllers/AccessoryController');

router.get('/:accessory_type', accessoryController.GetAllaccessory);

module.exports = router;