exports.up = pgm => {
  pgm.createTable('users', {
    id: {
      type: 'varchar(50)',
      primaryKey: true
    },
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true
    },
    password: {
      type: 'text',
      notNull: true
    },
    fullname: {
      type: 'text',
      notNull: true
    }
  });

  pgm.createIndex('users', 'username');
};

exports.down = pgm => {
  pgm.dropTable('users');
};
