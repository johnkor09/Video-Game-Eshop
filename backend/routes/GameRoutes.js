const express = require('express');
const router = express.Router();
const gameController = require('../controllers/GameController');

router.get('/:platform', gameController.GetAllGames);

module.exports = router;