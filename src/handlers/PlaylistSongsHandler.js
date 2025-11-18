const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verifikasi akses
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verifikasi akses
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

    if (!playlist) {
      const response = h.response({
        status: 'fail',
        message: 'Playlist tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verifikasi akses
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistSongsService.removeSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
