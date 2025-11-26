const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, playlistActivitiesService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._playlistActivitiesService = playlistActivitiesService;
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
    await this._playlistActivitiesService.addActivity(playlistId, songId, userId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, _h) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verifikasi akses
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlist = await this._playlistsService.getPlaylistById(playlistId);
    const songs = await this._playlistsService.getSongsFromPlaylist(playlistId);

    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request, _h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verifikasi akses
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistSongsService.removeSongFromPlaylist(playlistId, songId);
    await this._playlistActivitiesService.addActivity(playlistId, songId, userId, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
