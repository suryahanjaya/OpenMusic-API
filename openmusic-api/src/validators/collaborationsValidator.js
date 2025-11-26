const Joi = require('joi');

const InvariantError = require('../lib/error/InvariantError');

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validation = CollaborationPayloadSchema.validate(payload);
    if (validation.error) throw new InvariantError(validation.error.message);
  },
};

module.exports = CollaborationsValidator;
