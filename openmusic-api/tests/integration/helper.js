/* istanbul ignore file */
const pool = require('../../src/db/pool');

const TableTestHelper = {
  async cleanTable() {
    await pool.query('TRUNCATE TABLE authentications, songs, albums, users, playlists, playlist_songs, collaborations, playlist_song_activities CASCADE');
  },
};

module.exports = TableTestHelper;
