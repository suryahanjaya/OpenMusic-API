const albumService = require('../services/albumService');
const { validateAlbum } = require('../validators/albumValidator');

const createAlbum = async (req, res, next) => {
  try {
    // Validasi akan melempar error jika payload salah
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
    res.status(200).json({
      status: 'success',
      data: { album }
    });
  } catch (err) {
    next(err);
  }
};

const updateAlbum = async (req, res, next) => {
  try {
    const payload = await validateAlbum(req.body);
    await albumService.updateAlbum(req.params.id, payload);
    res.status(200).json({
      status: 'success',
      message: 'Album updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const deleteAlbum = async (req, res, next) => {
  try {
    await albumService.deleteAlbum(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Album deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAlbum, getAlbum, updateAlbum, deleteAlbum };