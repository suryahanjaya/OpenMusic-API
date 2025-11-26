const pool = require('../../db/pool');
const InvariantError = require('../../lib/error/InvariantError');

class AuthenticationsService {
  async addRefreshToken(token, userId) {
    await pool.query(
      'INSERT INTO authentications (token, user_id) VALUES ($1, $2)',
      [token, userId],
    );
  }

  async verifyRefreshToken(token) {
    const q = await pool.query(
      'SELECT token FROM authentications WHERE token = $1',
      [token],
    );

    if (q.rowCount === 0) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await pool.query(
      'DELETE FROM authentications WHERE token = $1',
      [token],
    );
  }
}

module.exports = AuthenticationsService;
