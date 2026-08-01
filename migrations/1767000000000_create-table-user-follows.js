/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_follows', {
    follower_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    followed_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('user_follows', 'user_follows_pk', {
    primaryKey: ['follower_id', 'followed_id'],
  });

  pgm.addConstraint('user_follows', 'user_follows_not_self', {
    check: 'follower_id <> followed_id',
  });

  pgm.sql('ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE user_follows DISABLE ROW LEVEL SECURITY;');
  pgm.dropTable('user_follows');
};
