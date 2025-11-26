const { nanoid } = require('nanoid');

const pool = require('../../db/pool');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3)',
      [id, playlistId, userId],
    );

    return id;
  }

  async deleteCollaboration(playlistId, userId) {
    await pool.query(
      'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      [playlistId, userId],
    );
  }
}

module.exports = CollaborationsService;
