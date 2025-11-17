const Joi = require('joi');

const songSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(), // Hapus .optional(), Joi defaultnya optional jika tidak ada required()
  albumId: Joi.string()   // Hapus .optional()
});

const validateSong = (payload) => songSchema.validateAsync(payload);

module.exports = { validateSong };