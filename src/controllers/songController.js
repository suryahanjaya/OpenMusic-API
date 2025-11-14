const songService = require('../services/songService');
const { validateSong } = require('../validators/songValidator');

const createSong = async (req, res, next) => {
  try {
    const payload = await validateSong(req.body);
    const songId = await songService.addSong(payload);
    res.status(201).json({ status: 'success', data: { songId } });
  } catch (err) {
    next(err);
  }
};

const getSongs = async (req, res, next) => {
  try {
    const filters = { title: req.query.title, performer: req.query.performer };
    const songs = await songService.getSongs(filters);
    res.status(200).json({ status: 'success', data: { songs } });
  } catch (err) {
    next(err);
  }
};

const getSong = async (req, res, next) => {
  try {
    const song = await songService.getSongById(req.params.id);
    if(!song) return res.status(404).json({ status: 'fail', message: 'Song not found' });
    res.status(200).json({ status: 'success', data: { song } });
  } catch (err) {
    next(err);
  }
};

const updateSong = async (req, res, next) => {
  try {
    const payload = await validateSong(req.body);
    const updated = await songService.updateSong(req.params.id, payload);
    if(!updated) return res.status(404).json({ status: 'fail', message: 'Song not found' });
    res.status(200).json({ status: 'success', message: 'Song updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteSong = async (req, res, next) => {
  try {
    const deleted = await songService.deleteSong(req.params.id);
    if(!deleted) return res.status(404).json({ status: 'fail', message: 'Song not found' });
    res.status(200).json({ status: 'success', message: 'Song deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSong, getSongs, getSong, updateSong, deleteSong };
