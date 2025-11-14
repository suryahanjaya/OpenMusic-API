const pool = require('../db');
const { nanoid } = require('nanoid');

const addSong = async (song) => {
  const id = `song-${nanoid(16)}`;
  const { title, year, genre, performer, duration, albumId } = song;
  await pool.query(
    'INSERT INTO songs(id, title, year, genre, performer, duration, albumId) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [id, title, year, genre, performer, duration || null, albumId || null]
  );
  return id;
};

const getSongs = async (filters) => {
  let query = 'SELECT id, title, performer FROM songs';
  const conditions = [];
  const values = [];
  
  if(filters.title) {
    conditions.push(`LOWER(title) LIKE $${values.length + 1}`);
    values.push(`%${filters.title.toLowerCase()}%`);
  }
  if(filters.performer) {
    conditions.push(`LOWER(performer) LIKE $${values.length + 1}`);
    values.push(`%${filters.performer.toLowerCase()}%`);
  }
  if(conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  const result = await pool.query(query, values);
  return result.rows;
};

const getSongById = async (id) => {
  const result = await pool.query('SELECT * FROM songs WHERE id=$1', [id]);
  if (!result.rows.length) return null;
  return result.rows[0];
};

const updateSong = async (id, song) => {
  const { title, year, genre, performer, duration, albumId } = song;
  const result = await pool.query(
    'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, albumId=$6 WHERE id=$7 RETURNING id',
    [title, year, genre, performer, duration || null, albumId || null, id]
  );
  return result.rows[0];
};

const deleteSong = async (id) => {
  const result = await pool.query('DELETE FROM songs WHERE id=$1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = { addSong, getSongs, getSongById, updateSong, deleteSong };
