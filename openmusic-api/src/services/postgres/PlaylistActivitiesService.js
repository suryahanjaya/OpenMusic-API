const { nanoid } = require('nanoid');

const pool = require('../../db/pool');

class PlaylistActivitiesService {
  async addActivity(playlistId, songId, userId, action) {
    const id = `act-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action) VALUES ($1, $2, $3, $4, $5)',
      [id, playlistId, songId, userId, action],
    );
  }

  async getActivities(playlistId) {
    const q = await pool.query(
      `SELECT users.username, songs.title, action, time
       FROM playlist_song_activities
       JOIN users ON users.id = playlist_song_activities.user_id
       JOIN songs ON songs.id = playlist_song_activities.song_id
       WHERE playlist_song_activities.playlist_id = $1
       ORDER BY time ASC`,
      [playlistId],
    );

    return q.rows;
  }
}

module.exports = PlaylistActivitiesService;
