const Joi = require('joi');

const InvariantError = require('../lib/error/InvariantError');

const AuthenticationsPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const AuthenticationsValidator = {
  validateAuthenticationPayload: (payload) => {
    const validation = AuthenticationsPayloadSchema.validate(payload);
    if (validation.error) throw new InvariantError(validation.error.message);
  },
  validateRefreshTokenPayload: (payload) => {
    const validation = RefreshTokenPayloadSchema.validate(payload);
    if (validation.error) throw new InvariantError(validation.error.message);
  },
};

module.exports = AuthenticationsValidator;
