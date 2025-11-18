const autoBind = require('auto-bind');
const AuthenticationError = require('../lib/error/AuthenticationError');
const AuthorizationError = require('../lib/error/AuthorizationError');
const InvariantError = require('../lib/error/InvariantError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validateAuthenticationPayload(request.payload);
      const { username, password } = request.payload;

      const userId = await this._usersService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ userId });
      const refreshToken = this._tokenManager.generateRefreshToken({ userId });

      await this._authService.addRefreshToken(refreshToken, userId);

      return h.response({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(401);
      }

      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan server',
      }).code(500);
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validateRefreshTokenPayload(request.payload);
      const { refreshToken } = request.payload;

      // verify signature
      const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
      await this._authService.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ userId });

      return {
        status: 'success',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      if (error instanceof InvariantError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }

      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan server',
      }).code(500);
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateRefreshTokenPayload(request.payload);
      const { refreshToken } = request.payload;

      this._tokenManager.verifyRefreshToken(refreshToken);
      await this._authService.verifyRefreshToken(refreshToken);
      await this._authService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Berhasil menghapus autentikasi',
      };
    } catch (error) {
      if (error instanceof InvariantError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }

      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan server',
      }).code(500);
    }
  }
}

module.exports = AuthenticationsHandler;
