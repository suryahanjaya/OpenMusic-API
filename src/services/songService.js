const pool = require('../db');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

const addSong = async ({ title, year, genre, performer, duration, albumId }) => {
  const id = `song-${nanoid(16)}`;
  
  // PERBAIKAN: Gunakan "albumId" (dengan kutip dua)
  const query = {
    text: 'INSERT INTO songs(id, title, year, genre, performer, duration, "albumId") VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    values: [id, title, year, genre, performer, duration, albumId],
  };

  const result = await pool.query(query);

  if (!result.rows[0].id) {
    throw new InvariantError('Lagu gagal ditambahkan');
  }

  return result.rows[0].id;
};

const getSongs = async ({ title, performer }) => {
  // Query dasar
  let text = 'SELECT id, title, performer FROM songs';
  const values = [];
  const conditions = [];

  // Fitur Pencarian (Optional Criteria)
  if (title) {
    values.push(`%${title}%`);
    conditions.push(`title ILIKE $${values.length}`); // ILIKE untuk case-insensitive di Postgres
  }

  if (performer) {
    values.push(`%${performer}%`);
    conditions.push(`performer ILIKE $${values.length}`);
  }

  if (conditions.length > 0) {
    text += ' WHERE ' + conditions.join(' AND ');
  }

  const query = { text, values };
  const result = await pool.query(query);
  return result.rows;
};

const getSongById = async (id) => {
  const query = {
    text: 'SELECT * FROM songs WHERE id = $1',
    values: [id],
  };
  const result = await pool.query(query);

  if (!result.rows.length) {
    throw new NotFoundError('Lagu tidak ditemukan');
  }

  return result.rows[0];
};

const updateSong = async (id, { title, year, genre, performer, duration, albumId }) => {
  // PERBAIKAN: Gunakan "albumId"
  const query = {
    text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
    values: [title, year, genre, performer, duration, albumId, id],
  };

  const result = await pool.query(query);

  if (!result.rows.length) {
    throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }
};

const deleteSong = async (id) => {
  const query = {
    text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
    values: [id],
  };

  const result = await pool.query(query);

  if (!result.rows.length) {
    throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }
};

module.exports = { addSong, getSongs, getSongById, updateSong, deleteSong };