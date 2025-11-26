const Joi = require('joi');

const InvariantError = require('../lib/error/InvariantError');

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PlaylistSongsValidator = {
  validatePlaylistSongPayload: (payload) => {
    const validation = PlaylistSongPayloadSchema.validate(payload);
    if (validation.error) throw new InvariantError(validation.error.message);
  },
};

module.exports = PlaylistSongsValidator;
