const autoBind = require('auto-bind');

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
  }

  async putAuthenticationHandler(request, _h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    try {
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
      // If it's already an InvariantError from the service, re-throw it
      if (error.name === 'InvariantError' || error.statusCode === 400) {
        throw error;
      }
      // Any other error from JWT verification should return 400
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteAuthenticationHandler(request, _h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    try {
      this._tokenManager.verifyRefreshToken(refreshToken);
      await this._authService.verifyRefreshToken(refreshToken);
      await this._authService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Berhasil menghapus autentikasi',
      };
    } catch (error) {
      // If it's already an InvariantError from the service, re-throw it
      if (error.name === 'InvariantError' || error.statusCode === 400) {
        throw error;
      }
      // Any other error from JWT verification should return 400
      throw new InvariantError('Refresh token tidak valid');
    }
  }
}

module.exports = AuthenticationsHandler;
