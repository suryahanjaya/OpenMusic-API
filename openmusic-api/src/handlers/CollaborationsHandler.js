const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collabService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;

    // only owner can add collaborator
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._usersService.verifyUserExist(userId);

    const collaborationId = await this._collabService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._collabService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborator berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
