const autoBind = require('auto-bind');

class UsersHandler {
  constructor(usersService, usersValidator) {
    this._service = usersService;
    this._validator = usersValidator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
