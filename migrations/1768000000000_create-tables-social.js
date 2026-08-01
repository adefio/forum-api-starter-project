/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Suka pada postingan (thread)
  pgm.createTable('thread_likes', {
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('thread_likes', 'thread_likes_pk', {
    primaryKey: ['user_id', 'thread_id'],
  });
  pgm.addConstraint('thread_likes', 'fk_thread_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('thread_likes', 'fk_thread_likes.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.sql('ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;');

  // Simpan / bookmark postingan
  pgm.createTable('user_bookmarks', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
  pgm.addConstraint('user_bookmarks', 'fk_user_bookmarks.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_bookmarks', 'fk_user_bookmarks.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.sql('ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;');

  // Percakapan pesan langsung
  pgm.createTable('conversations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createTable('conversation_participants', {
    conversation_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('conversation_participants', 'conversation_participants_pk', {
    primaryKey: ['conversation_id', 'user_id'],
  });
  pgm.addConstraint('conversation_participants', 'fk_conversation_participants.conversation_id_conversations.id', 'FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE');
  pgm.addConstraint('conversation_participants', 'fk_conversation_participants.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

  pgm.createTable('messages', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    conversation_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    sender_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    is_read: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });
  pgm.addConstraint('messages', 'fk_messages.conversation_id_conversations.id', 'FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE');
  pgm.addConstraint('messages', 'fk_messages.sender_id_users.id', 'FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.sql('ALTER TABLE messages ENABLE ROW LEVEL SECURITY;');

  // Notifikasi (suka, komentar, balasan, ikuti)
  pgm.createTable('notifications', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    actor_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    type: {
      type: 'VARCHAR(20)',
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
    },
    comment_id: {
      type: 'VARCHAR(50)',
    },
    is_read: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addConstraint('notifications', 'fk_notifications.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('notifications', 'fk_notifications.actor_id_users.id', 'FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('notifications', 'fk_notifications.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('notifications', 'fk_notifications.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.sql('ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;');

  // Pengaturan privasi pengguna
  pgm.createTable('user_settings', {
    user_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    is_private: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    show_analytics: {
      type: 'BOOLEAN',
      notNull: true,
      default: true,
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
  pgm.addConstraint('user_settings', 'fk_user_settings.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.sql('ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;');
};

exports.down = (pgm) => {
  pgm.dropTable('user_settings');
  pgm.dropTable('notifications');
  pgm.dropTable('messages');
  pgm.dropTable('conversation_participants');
  pgm.dropTable('conversations');
  pgm.dropTable('user_bookmarks');
  pgm.dropTable('thread_likes');
};
