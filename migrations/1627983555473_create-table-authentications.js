/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.sql('ALTER TABLE authentications ENABLE ROW LEVEL SECURITY;');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE authentications DISABLE ROW LEVEL SECURITY;');
  pgm.dropTable('authentications');
};