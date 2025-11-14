const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

router.post('/', songController.createSong);
router.get('/', songController.getSongs);
router.get('/:id', songController.getSong);
router.put('/:id', songController.updateSong);
router.delete('/:id', songController.deleteSong);

module.exports = router;
