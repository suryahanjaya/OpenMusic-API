const { nanoid } = require('nanoid');
const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');
const AuthorizationError = require('../../lib/error/AuthorizationError');

class PlaylistsService {
  // Membuat playlist baru
  async createPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3)',
      [id, name, owner]
    );

    return id;
  }

  // Ambil semua playlist milik user
  async getPlaylists(owner) {
    const q = await pool.query(
      `SELECT playlists.id, playlists.name, users.username
       FROM playlists
       LEFT JOIN users ON users.id = playlists.owner
       WHERE playlists.owner = $1`,
      [owner]
    );

    return q.rows;
  }

  // Verifikasi owner playlist
  async verifyPlaylistOwner(id, owner) {
    const q = await pool.query(
      'SELECT owner FROM playlists WHERE id = $1',
      [id]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    if (q.rows[0].owner !== owner) {
      throw new AuthorizationError('Akses ditolak');
    }
  }

  // Verifikasi akses playlist (bisa owner)
  async verifyPlaylistAccess(playlistId, userId) {
    const q = await pool.query(
      'SELECT owner FROM playlists WHERE id = $1',
      [playlistId]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    if (q.rows[0].owner !== userId) {
      throw new AuthorizationError('Akses ditolak');
    }
  }

  // Ambil semua lagu dalam playlist
  async getSongsFromPlaylist(playlistId) {
    const q = await pool.query(
      `SELECT songs.id, songs.title, songs.performer
       FROM songs
       JOIN playlist_songs ON songs.id = playlist_songs.song_id
       WHERE playlist_songs.playlist_id = $1`,
      [playlistId]
    );

    return q.rows;
  }

  // Hapus lagu dari playlist
  async removeSongFromPlaylist(playlistId, songId) {
    const result = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      [playlistId, songId]
    );

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Pastikan lagu ada di playlist.');
    }
  }

  // Hapus playlist
  async deletePlaylistById(id) {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1',
      [id]
    );

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }
}

module.exports = PlaylistsService;
