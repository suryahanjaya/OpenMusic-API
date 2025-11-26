const Joi = require('joi');

const InvariantError = require('../lib/error/InvariantError');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validation = PlaylistPayloadSchema.validate(payload);
    if (validation.error) throw new InvariantError(validation.error.message);
  },
};

module.exports = PlaylistsValidator;
