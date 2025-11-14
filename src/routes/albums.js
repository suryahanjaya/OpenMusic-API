const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

router.post('/', albumController.createAlbum);
router.get('/:id', albumController.getAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);

module.exports = router;
