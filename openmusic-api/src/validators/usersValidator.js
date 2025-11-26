const Joi = require('joi');

const InvariantError = require('../lib/error/InvariantError');

const UsersPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validation = UsersPayloadSchema.validate(payload);
    if (validation.error) {
      throw new InvariantError(validation.error.message);
    }
  },
};

module.exports = UsersValidator;
