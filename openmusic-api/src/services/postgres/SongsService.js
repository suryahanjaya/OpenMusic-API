const pool = require('../../db/pool');
const { generateId } = require('../../utils/idGenerator');
const InvariantError = require('../../lib/error/InvariantError');
const NotFoundError = require('../../lib/error/ClientError');

class SongsService {
  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = generateId('song');
    const query = {
      text: 'INSERT INTO songs(id, title, year, performer, genre, duration, album_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING id',
      values: [id, title, year, performer, genre, duration || null, albumId || null],
    };
    const result = await pool.query(query);
    if (!result.rows[0]?.id) throw new InvariantError('Gagal menambahkan lagu');
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    // search with ILIKE lower-based indexes
    let base = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];
    if (title) {
      values.push(`%${title.toLowerCase()}%`);
      conditions.push(`lower(title) LIKE $${values.length}`);
    }
    if (performer) {
      values.push(`%${performer.toLowerCase()}%`);
      conditions.push(`lower(performer) LIKE $${values.length}`);
    }
    if (conditions.length) base += ` WHERE ${conditions.join(' AND ')}`;
    const result = await pool.query({ text: base, values });
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan', 404);
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      year: row.year,
      performer: row.performer,
      genre: row.genre,
      duration: row.duration,
      albumId: row.album_id,
    };
  }

  async editSongById(id, payload) {
    const { title, year, performer, genre, duration, albumId } = payload;
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6, updated_at = current_timestamp WHERE id=$7 RETURNING id',
      values: [title, year, performer, genre, duration || null, albumId || null, id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui. Id tidak ditemukan', 404);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan', 404);
  }
}

module.exports = SongsService;
