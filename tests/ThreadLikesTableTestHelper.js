/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadLikesTableTestHelper = {
  async addLike({ userId = 'user-123', threadId = 'thread-123' }) {
    const query = {
      text: 'INSERT INTO thread_likes VALUES($1, $2)',
      values: [userId, threadId],
    };

    await pool.query(query);
  },

  async checkLikeIsExists(userId, threadId) {
    const query = {
      text: 'SELECT * FROM thread_likes WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_likes WHERE 1=1');
  },
};

module.exports = ThreadLikesTableTestHelper;
