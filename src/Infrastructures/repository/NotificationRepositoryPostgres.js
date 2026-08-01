const NotificationRepository = require('../../Domains/notifications/NotificationRepository');

class NotificationRepositoryPostgres extends NotificationRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addNotification({ userId, actorId, type, threadId = null, commentId = null }) {
    const id = `notification-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO notifications(id, user_id, actor_id, type, thread_id, comment_id, is_read, date) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, user_id, actor_id, type, is_read, date',
      values: [id, userId, actorId, type, threadId, commentId, false, date],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getNotifications(userId, type) {
    const query = {
      text: `SELECT n.id, n.type, n.is_read, n.date, u.id AS actor_id, u.username AS actor_username, u.fullname AS actor_fullname, t.id AS thread_id, t.title AS thread_title
             FROM notifications n
             JOIN users u ON u.id = n.actor_id
             LEFT JOIN threads t ON t.id = n.thread_id
             WHERE n.user_id = $1 AND ($2 = 'all' OR n.type = $2)
             ORDER BY n.date DESC
             LIMIT 50`,
      values: [userId, type],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      isRead: row.is_read,
      date: row.date,
      actor: {
        id: row.actor_id,
        username: row.actor_username,
        fullname: row.actor_fullname,
      },
      thread: row.thread_id ? { id: row.thread_id, title: row.thread_title } : null,
    }));
  }

  async getUnreadCount(userId) {
    const query = {
      text: 'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async markAsRead(userId, notificationId) {
    const query = {
      text: 'UPDATE notifications SET is_read = true WHERE user_id = $1 AND id = $2',
      values: [userId, notificationId],
    };

    await this._pool.query(query);
  }

  async markAllAsRead(userId) {
    const query = {
      text: 'UPDATE notifications SET is_read = true WHERE user_id = $1',
      values: [userId],
    };

    await this._pool.query(query);
  }
}

module.exports = NotificationRepositoryPostgres;
