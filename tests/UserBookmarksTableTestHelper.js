/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const UserBookmarksTableTestHelper = {
  async addBookmark({ id = 'bookmark-123', userId = 'user-123', threadId = 'thread-123' }) {
    const query = {
      text: 'INSERT INTO user_bookmarks VALUES($1, $2, $3)',
      values: [id, userId, threadId],
    };

    await pool.query(query);
  },

  async checkBookmarkIsExists(userId, threadId) {
    const query = {
      text: 'SELECT * FROM user_bookmarks WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_bookmarks WHERE 1=1');
  },
};

module.exports = UserBookmarksTableTestHelper;
