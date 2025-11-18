const pool = require('../db/pool');
const { generateId } = require('../utils/idGenerator');
const InvariantError = require('../lib/error/InvariantError');
const NotFoundError = require('../lib/error/ClientError'); // reuse ClientError with 404

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = generateId('album');
    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await pool.query(query);
    if (!result.rows[0]?.id) throw new InvariantError('Gagal menambahkan album');
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
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

  async getAlbumWithSongs(id) {
    // ambil album
    const albumQuery = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
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
}

module.exports = AlbumsService;
