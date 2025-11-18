const { nanoid } = require('nanoid');
const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');

class PlaylistsService {
  async createPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3)',
      [id, name, owner]
    );

    return id;
  }

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

  async verifyPlaylistOwner(id, owner) {
    const q = await pool.query(
      'SELECT owner FROM playlists WHERE id = $1',
      [id]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('playlist tidak ditemukan');
    }

    if (q.rows[0].owner !== owner) {
      throw new InvariantError('akses ditolak');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const q = await pool.query(
      'SELECT owner FROM playlists WHERE id = $1',
      [playlistId]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    if (q.rows[0].owner !== userId) {
      throw new InvariantError('Akses ditolak');
    }
  }

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
  
  async removeSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Pastikan lagu ada di playlist.');
    }
  }
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }
}

module.exports = PlaylistsService;
