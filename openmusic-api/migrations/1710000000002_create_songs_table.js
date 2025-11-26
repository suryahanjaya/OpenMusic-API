exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    genre: { type: 'varchar(100)', notNull: true },
    duration: { type: 'integer' },
    album_id: {
      type: 'varchar(50)',
      references: '"albums"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('songs', 'lower(title)', { name: 'idx_songs_title' });
  pgm.createIndex('songs', 'lower(performer)', { name: 'idx_songs_performer' });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
