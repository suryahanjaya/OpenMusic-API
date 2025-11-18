const Jwt = require('@hapi/jwt');

const TokenManager = {
  generateAccessToken(payload) {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },

  generateRefreshToken(payload) {
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
  },

  verifyRefreshToken(token) {
    const artifacts = Jwt.token.decode(token);
    Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
    return artifacts.decoded.payload;
  },
};

module.exports = TokenManager;
