const pool = require('./pool');

class PlaylistsService {
  async getPlaylistById(id) {
    const query = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
