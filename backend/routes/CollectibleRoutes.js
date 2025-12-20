const express = require('express');
const router = express.Router();
const collectibleController = require('../controllers/CollectibleController');

router.get('/:collectible_type', collectibleController.GetAllcollectibles);

module.exports = router;