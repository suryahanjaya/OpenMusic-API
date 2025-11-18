const { nanoid } = require('nanoid');
const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');

class PlaylistSongsService {
  async addSongToPlaylist(playlistId, songId) {
    console.log('Memasukkan lagu ke playlist:', { playlistId, songId });

    // cek apakah lagu ada di tabel songs
    const songCheck = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [songId]
    );
    if (!songCheck.rowCount) {
      throw new InvariantError('Lagu tidak ditemukan di database');
    }

    // cek dulu apakah lagu sudah ada di playlist
    const check = await pool.query(
      'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [playlistId, songId]
    );
    console.log('Hasil pengecekan lagu:', check.rows);

    if (check.rowCount) {
      console.log('Lagu sudah ada, throw error');
      throw new InvariantError('Lagu sudah ada di playlist');
    }

    const id = `ps-${nanoid(16)}`;
    const result = await pool.query(
      'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3)',
      [id, playlistId, songId]
    );

    console.log('Hasil insert:', result.rowCount, 'baris ditambahkan dengan id', id);

    return id;
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
    const result = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      [playlistId, songId]
    );

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Pastikan lagu ada di playlist.');
    }
  }
}

module.exports = PlaylistSongsService;
