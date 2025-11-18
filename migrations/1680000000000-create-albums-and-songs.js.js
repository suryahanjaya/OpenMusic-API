/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createTable('songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    genre: { type: 'varchar(100)', notNull: true },
    duration: { type: 'integer' },
    album_id: { type: 'varchar(50)', references: '"albums"', onDelete: 'cascade' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.sql('CREATE INDEX songs_title_idx ON songs (lower(title));');
  pgm.sql('CREATE INDEX songs_performer_idx ON songs (lower(performer));');
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
  pgm.dropTable('albums');
};
