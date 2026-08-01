/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const MessagesTableTestHelper = {
  async addConversation({
    id = 'conversation-123',
    participantOneId = 'user-123',
    participantTwoId = 'user-456',
  }) {
    const conversationQuery = {
      text: 'INSERT INTO conversations VALUES($1)',
      values: [id],
    };
    const participantOneQuery = {
      text: 'INSERT INTO conversation_participants VALUES($1, $2)',
      values: [id, participantOneId],
    };
    const participantTwoQuery = {
      text: 'INSERT INTO conversation_participants VALUES($1, $2)',
      values: [id, participantTwoId],
    };

    await pool.query(conversationQuery);
    await pool.query(participantOneQuery);
    await pool.query(participantTwoQuery);
  },

  async addMessage({
    id = 'message-123',
    conversationId = 'conversation-123',
    senderId = 'user-123',
    content = 'sebuah pesan',
    date = '2021-08-08T07:19:09.775Z',
    isRead = false,
  }) {
    const query = {
      text: 'INSERT INTO messages VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, conversationId, senderId, content, date, isRead],
    };

    await pool.query(query);
  },

  async findMessagesByConversationId(conversationId) {
    const query = {
      text: 'SELECT * FROM messages WHERE conversation_id = $1',
      values: [conversationId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE messages, conversation_participants, conversations CASCADE');
  },
};

module.exports = MessagesTableTestHelper;
