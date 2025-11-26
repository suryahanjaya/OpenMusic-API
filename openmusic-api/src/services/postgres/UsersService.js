const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');
const AuthenticationError = require('../../lib/error/AuthenticationError');
const NotFoundError = require('../../lib/error/NotFoundError');

class UsersService {
  // Menambahkan user baru
  async addUser({ username, password, fullname }) {
    // Cek apakah username sudah ada
    const check = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username],
    );

    if (check.rowCount > 0) {
      throw new InvariantError('Username sudah dipakai');
    }

    // Buat ID user baru
    const id = `user-${nanoid(16)}`;
    const hashed = await bcrypt.hash(password, 10);

    // Simpan user ke database
    await pool.query(
      'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4)',
      [id, username, hashed, fullname],
    );

    return id;
  }

  // Verifikasi kredensial login
  async verifyUserCredential(username, password) {
    const q = await pool.query(
      'SELECT id, password FROM users WHERE username = $1',
      [username],
    );

    if (q.rowCount === 0) {
      throw new AuthenticationError('Username atau password salah');
    }

    const { id, password: hashed } = q.rows[0];
    const match = await bcrypt.compare(password, hashed);

    if (!match) {
      throw new AuthenticationError('Username atau password salah');
    }

    return id;
  }

  // Ambil data user berdasarkan ID
  async getUserById(id) {
    const q = await pool.query(
      'SELECT id, username, fullname FROM users WHERE id = $1',
      [id],
    );

    if (q.rowCount === 0) {
      throw new AuthenticationError('User tidak ditemukan');
    }

    return q.rows[0];
  }

  async verifyUserExist(id) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }
}

module.exports = UsersService;
