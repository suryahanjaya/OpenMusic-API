const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');

class UsersService {
  async addUser({ username, password, fullname }) {
    const check = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (check.rowCount > 0) {
      throw new InvariantError('username sudah dipakai');
    }

    const id = `user-${nanoid(16)}`;
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4)',
      [id, username, hashed, fullname]
    );

    return id;
  }

  async verifyUserCredential(username, password) {
    const q = await pool.query(
      'SELECT id, password FROM users WHERE username = $1',
      [username]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('username atau password salah');
    }

    const { id, password: hashed } = q.rows[0];
    const match = await bcrypt.compare(password, hashed);

    if (!match) {
      throw new InvariantError('username atau password salah');
    }

    return id;
  }

  async getUserById(id) {
    const q = await pool.query(
      'SELECT id, username, fullname FROM users WHERE id = $1',
      [id]
    );

    if (q.rowCount === 0) {
      throw new InvariantError('user tidak ditemukan');
    }

    return q.rows[0];
  }
}

module.exports = UsersService;
