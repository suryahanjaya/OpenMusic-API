const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, cacheService, validator, uploadsValidator) {
    this._service = service;
    this._storageService = storageService;
    this._cacheService = cacheService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      data: { albumId },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumWithSongs(id);
    return {
      status: 'success',
      data: { album },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const { id } = request.params;
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.addCoverAlbumById(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._service.addLikeAlbum(credentialId, id);

    await this._cacheService.delete(`likes:${id}`);

    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeAlbum(credentialId, id);
    await this._cacheService.delete(`likes:${id}`);

    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }

  async getLikesHandler(request, h) {
    const { id } = request.params;

    try {
      const result = await this._cacheService.get(`likes:${id}`);
      if (result) {
        const response = h.response({
          status: 'success',
          data: {
            likes: JSON.parse(result),
          },
        });
        response.header('X-Data-Source', 'cache');
        return response;
      }
    } catch {
      // ignore
    }

    const likes = await this._service.getLikesCount(id);
    await this._cacheService.set(`likes:${id}`, JSON.stringify(likes));

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumsHandler;
