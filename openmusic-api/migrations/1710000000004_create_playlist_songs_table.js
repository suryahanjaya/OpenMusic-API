exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
  });

  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists(id)', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs(id)', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('playlist_songs', ['playlist_id', 'song_id'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
