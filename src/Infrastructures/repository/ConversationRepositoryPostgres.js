const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ConversationRepository = require('../../Domains/messages/ConversationRepository');

class ConversationRepositoryPostgres extends ConversationRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getConversationByUsers(userId, otherUserId) {
    const query = {
      text: `SELECT cp1.conversation_id
             FROM conversation_participants cp1
             JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
             WHERE cp1.user_id = $1 AND cp2.user_id = $2`,
      values: [userId, otherUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null;
    }

    return result.rows[0].conversation_id;
  }

  async getOrCreateDirectConversation(userId, otherUserId) {
    const conversationId = await this.getConversationByUsers(userId, otherUserId);

    if (conversationId) {
      return { conversationId, isNew: false };
    }

    const id = `conversation-${this._idGenerator()}`;

    const createConversationQuery = {
      text: 'INSERT INTO conversations VALUES($1)',
      values: [id],
    };

    const addParticipantQuery = {
      text: 'INSERT INTO conversation_participants VALUES($1, $2)',
      values: [id, userId],
    };

    const addOtherParticipantQuery = {
      text: 'INSERT INTO conversation_participants VALUES($1, $2)',
      values: [id, otherUserId],
    };

    await this._pool.query(createConversationQuery);
    await this._pool.query(addParticipantQuery);
    await this._pool.query(addOtherParticipantQuery);

    return { conversationId: id, isNew: true };
  }

  async addMessage(conversationId, senderId, content) {
    const id = `message-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO messages VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, date, sender_id, is_read',
      values: [id, conversationId, senderId, content, date, false],
    };

    const result = await this._pool.query(query);

    const { is_read: isRead, sender_id: senderIdResult, ...message } = result.rows[0];
    return { ...message, senderId: senderIdResult, isRead };
  }

  async getMessagesByConversationId(conversationId) {
    const query = {
      text: `SELECT messages.id, messages.conversation_id, messages.sender_id, users.username,
                    messages.content, messages.date, messages.is_read
             FROM messages
             JOIN users ON messages.sender_id = users.id
             WHERE messages.conversation_id = $1
             ORDER BY messages.date ASC`,
      values: [conversationId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      username: row.username,
      content: row.content,
      date: row.date,
      isRead: row.is_read,
    }));
  }

  async getConversationsByUserId(userId) {
    const query = {
      text: `SELECT conversations.id AS conversation_id,
                    users.id AS user_id,
                    users.username,
                    users.fullname,
                    last_message.id AS last_message_id,
                    last_message.content AS last_message_content,
                    last_message.date AS last_message_date,
                    last_message.sender_id AS last_message_sender_id,
                    last_message.is_read AS last_message_is_read,
                    CAST(COUNT(unread_messages.id) AS INTEGER) AS unread_count
             FROM conversations
             JOIN conversation_participants me
               ON me.conversation_id = conversations.id AND me.user_id = $1
             JOIN conversation_participants other
               ON other.conversation_id = conversations.id AND other.user_id <> $1
             JOIN users
               ON users.id = other.user_id
             LEFT JOIN LATERAL (
               SELECT id, content, date, sender_id, is_read
               FROM messages
               WHERE conversation_id = conversations.id
               ORDER BY date DESC
               LIMIT 1
             ) last_message ON TRUE
             LEFT JOIN messages unread_messages
               ON unread_messages.conversation_id = conversations.id
              AND unread_messages.sender_id <> $1
              AND unread_messages.is_read = false
             GROUP BY conversations.id, users.id, users.username, users.fullname,
                      last_message.id, last_message.content, last_message.date,
                      last_message.sender_id, last_message.is_read
             ORDER BY last_message.date DESC NULLS LAST`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      conversationId: row.conversation_id,
      user: {
        id: row.user_id,
        username: row.username,
        fullname: row.fullname,
      },
      lastMessage: row.last_message_id
        ? {
          id: row.last_message_id,
          content: row.last_message_content,
          date: row.last_message_date,
          senderId: row.last_message_sender_id,
          isRead: row.last_message_is_read,
        }
        : null,
      unreadCount: row.unread_count,
    }));
  }

  async verifyConversationParticipant(conversationId, userId) {
    const conversationQuery = {
      text: 'SELECT id FROM conversations WHERE id = $1',
      values: [conversationId],
    };

    const conversationResult = await this._pool.query(conversationQuery);

    if (!conversationResult.rowCount) {
      throw new NotFoundError('percakapan tidak ditemukan');
    }

    const participantQuery = {
      text: 'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      values: [conversationId, userId],
    };

    const participantResult = await this._pool.query(participantQuery);

    if (!participantResult.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses percakapan ini');
    }
  }

  async markMessagesRead(conversationId, userId) {
    const query = {
      text: `UPDATE messages
             SET is_read = true
             WHERE conversation_id = $1 AND sender_id <> $2 AND is_read = false`,
      values: [conversationId, userId],
    };

    await this._pool.query(query);
  }
}

module.exports = ConversationRepositoryPostgres;
