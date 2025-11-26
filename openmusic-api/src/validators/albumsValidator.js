const Joi = require('joi');

const ClientError = require('../lib/error/ClientError');

const albumSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

const validateAlbumPayload = (payload) => {
  const { error } = albumSchema.validate(payload);
  if (error) throw new ClientError(error.message, 400);
};

module.exports = { validateAlbumPayload, albumSchema };
