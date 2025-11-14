const pool = require('../db');
const { nanoid } = require('nanoid');

const addAlbum = async ({ name, year }) => {
  const id = `album-${nanoid(16)}`;
  await pool.query(
    'INSERT INTO albums(id, name, year) VALUES($1, $2, $3)',
    [id, name, year]
  );
  return id;
};

const getAlbumById = async (id) => {
  // Ambil data album
  const albumResult = await pool.query('SELECT * FROM albums WHERE id=$1', [id]);
  if (!albumResult.rows.length) return null;
  const album = albumResult.rows[0];

  // Ambil daftar lagu album
  const songsResult = await pool.query(
    'SELECT id, title, performer FROM songs WHERE albumId=$1',
    [id]
  );
  album.songs = songsResult.rows; // tambahkan property songs

  return album;
};

const updateAlbum = async (id, { name, year }) => {
  const result = await pool.query(
    'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
    [name, year, id]
  );
  return result.rows[0];
};

const deleteAlbum = async (id) => {
  const result = await pool.query('DELETE FROM albums WHERE id=$1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = { addAlbum, getAlbumById, updateAlbum, deleteAlbum };
