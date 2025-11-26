const pool = require('../../db/pool');
const { generateId } = require('../../utils/idGenerator');
const InvariantError = require('../../lib/error/InvariantError');
const NotFoundError = require('../../lib/error/ClientError'); // reuse ClientError with 404

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = generateId('album');
    const query = {
      text: 'INSERT INTO albums(id, name, year, created_at, updated_at) VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
      values: [id, name, year],
    };
    const result = await pool.query(query);
    if (!result.rows[0]?.id) throw new InvariantError('Gagal menambahkan album');
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Album tidak ditemukan', 404);
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = current_timestamp WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui. Id tidak ditemukan', 404);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan', 404);
  }

  async addCoverAlbumById(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui cover. Id tidak ditemukan', 404);
  }

  async getAlbumWithSongs(id) {
    // ambil album
    const albumQuery = {
      text: 'SELECT id, name, year, cover as "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const albumRes = await pool.query(albumQuery);
    if (!albumRes.rowCount) throw new NotFoundError('Album tidak ditemukan', 404);

    // ambil songs dalam album
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsRes = await pool.query(songsQuery);
    return {
      ...albumRes.rows[0],
      songs: songsRes.rows,
    };
  }

  async addLikeAlbum(userId, albumId) {
    const queryCheck = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const resultCheck = await pool.query(queryCheck);
    if (resultCheck.rowCount > 0) {
      throw new InvariantError('Gagal menyukai album. Album sudah disukai');
    }

    const id = generateId('like');
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await pool.query(query);
    if (!result.rows[0].id) throw new InvariantError('Gagal menyukai album');
  }

  async deleteLikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal batal menyukai album', 404);
  }

  async getLikesCount(albumId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  async checkLikeStatus(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await pool.query(query);
    return result.rowCount > 0;
  }
}

module.exports = AlbumsService;
