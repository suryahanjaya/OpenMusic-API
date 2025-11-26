exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'varchar(50)', notNull: true },
  });

  // foreign key ke users.id
  pgm.addConstraint('playlists', 'fk_playlists.owner_users(id)', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('playlists', 'owner');
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
