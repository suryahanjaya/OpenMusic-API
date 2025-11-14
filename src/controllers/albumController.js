const albumService = require('../services/albumService');
const { validateAlbum } = require('../validators/albumValidator');

const createAlbum = async (req, res, next) => {
  try {
    const payload = await validateAlbum(req.body);
    const albumId = await albumService.addAlbum(payload);
    res.status(201).json({
      status: 'success',
      data: { albumId }
    });
  } catch (err) {
    next(err);
  }
};

const getAlbum = async (req, res, next) => {
  try {
    const album = await albumService.getAlbumById(req.params.id);
    if (!album) return res.status(404).json({ status: 'fail', message: 'Album not found' });
    res.status(200).json({ status: 'success', data: { album } });
  } catch (err) {
    next(err);
  }
};

const updateAlbum = async (req, res, next) => {
  try {
    const payload = await validateAlbum(req.body);
    const updated = await albumService.updateAlbum(req.params.id, payload);
    if (!updated) return res.status(404).json({ status: 'fail', message: 'Album not found' });
    res.status(200).json({ status: 'success', message: 'Album updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteAlbum = async (req, res, next) => {
  try {
    const deleted = await albumService.deleteAlbum(req.params.id);
    if (!deleted) return res.status(404).json({ status: 'fail', message: 'Album not found' });
    res.status(200).json({ status: 'success', message: 'Album deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAlbum, getAlbum, updateAlbum, deleteAlbum };
