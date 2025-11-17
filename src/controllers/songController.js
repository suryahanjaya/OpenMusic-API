const songService = require('../services/songService');
const { validateSong } = require('../validators/songValidator');

const createSong = async (req, res, next) => {
  try {
    const payload = await validateSong(req.body);
    const songId = await songService.addSong(payload);
    res.status(201).json({
      status: 'success',
      data: { songId }
    });
  } catch (err) {
    next(err);
  }
};

const getSongs = async (req, res, next) => {
  try {
    const { title, performer } = req.query;
    const songs = await songService.getSongs({ title, performer });
    res.status(200).json({
      status: 'success',
      data: { songs }
    });
  } catch (err) {
    next(err);
  }
};

const getSong = async (req, res, next) => {
  try {
    const song = await songService.getSongById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { song }
    });
  } catch (err) {
    next(err);
  }
};

const updateSong = async (req, res, next) => {
  try {
    const payload = await validateSong(req.body);
    await songService.updateSong(req.params.id, payload);
    res.status(200).json({
      status: 'success',
      message: 'Song updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const deleteSong = async (req, res, next) => {
  try {
    await songService.deleteSong(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Song deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSong, getSongs, getSong, updateSong, deleteSong };