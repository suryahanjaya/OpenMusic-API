const autoBind = require('auto-bind');

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

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    // verify signature & registered
    this._tokenManager.verifyRefreshToken(refreshToken);
    await this._authService.verifyRefreshToken(refreshToken);

    const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ userId });

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    this._tokenManager.verifyRefreshToken(refreshToken);
    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Berhasil menghapus autentikasi',
    };
  }
}

module.exports = AuthenticationsHandler;
