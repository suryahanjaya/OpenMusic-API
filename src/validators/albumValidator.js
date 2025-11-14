const Joi = require('joi');

const albumSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required()
});

const validateAlbum = (payload) => albumSchema.validateAsync(payload);

module.exports = { validateAlbum };
