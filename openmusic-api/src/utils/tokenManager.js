const Jwt = require('@hapi/jwt');

const config = require('../config');

const TokenManager = {
  generateAccessToken(payload) {
    const tokenPayload = { ...payload, type: 'access' };
    return Jwt.token.generate(tokenPayload, config.jwt.accessTokenKey);
  },

  generateRefreshToken(payload) {
    const tokenPayload = { ...payload, type: 'refresh' };
    return Jwt.token.generate(tokenPayload, config.jwt.refreshTokenKey);
  },

  verifyRefreshToken(token) {
    const artifacts = Jwt.token.decode(token);
    Jwt.token.verifySignature(artifacts, config.jwt.refreshTokenKey);
    const { payload } = artifacts.decoded;

    if (payload.type && payload.type !== 'refresh') {
      throw new Error('Refresh token tidak valid');
    }
    return payload;
  },
};

module.exports = TokenManager;
