const Joi = require('joi');

const ClientError = require('../lib/error/ClientError');

const songSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().allow(null),
  albumId: Joi.string().allow(null),
});

const validateSongPayload = (payload) => {
  const { error } = songSchema.validate(payload);
  if (error) throw new ClientError(error.message, 400);
};

module.exports = { validateSongPayload, songSchema };
