const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, owner) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async verifyThreadOwner(threadId, owner) {
    const query = {
      text: 'SELECT owner FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const thread = result.rows[0];

    if (thread.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getThreadById(threadId, userId = null) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.date, u.username,
                    (SELECT COUNT(*)::int FROM comments c WHERE c.thread_id = t.id) AS comment_count,
                    (SELECT COUNT(*)::int FROM thread_likes tl WHERE tl.thread_id = t.id) AS like_count,
                    ($2::varchar IS NOT NULL AND EXISTS(SELECT 1 FROM thread_likes tl WHERE tl.thread_id = t.id AND tl.user_id = $2)) AS is_liked,
                    ($2::varchar IS NOT NULL AND EXISTS(SELECT 1 FROM user_bookmarks b WHERE b.thread_id = t.id AND b.user_id = $2)) AS is_bookmarked
             FROM threads t
             JOIN users u ON t.owner = u.id
             WHERE t.id = $1`,
      values: [threadId, userId || null],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }

  async getAllThreads(userId = null, filters = {}) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.date, u.username,
                    (SELECT COUNT(*)::int FROM comments c WHERE c.thread_id = t.id) AS comment_count,
                    (SELECT COUNT(*)::int FROM thread_likes tl WHERE tl.thread_id = t.id) AS like_count,
                    ($1::varchar IS NOT NULL AND EXISTS(SELECT 1 FROM thread_likes tl WHERE tl.thread_id = t.id AND tl.user_id = $1)) AS is_liked,
                    ($1::varchar IS NOT NULL AND EXISTS(SELECT 1 FROM user_bookmarks b WHERE b.thread_id = t.id AND b.user_id = $1)) AS is_bookmarked,
                    COALESCE((SELECT json_agg(x ORDER BY x.date DESC) FROM (SELECT c2.content, u2.username, c2.date FROM comments c2 JOIN users u2 ON u2.id = c2.owner WHERE c2.thread_id = t.id AND c2.is_delete = false ORDER BY c2.date DESC LIMIT 2) x), '[]'::json) AS recent_comments
             FROM threads t
             JOIN users u ON t.owner = u.id
             WHERE ($2::text = '' OR t.title ILIKE '%' || $2 || '%' OR t.body ILIKE '%' || $2 || '%')
               AND ($3::text IS NULL OR (CASE $3 WHEN 'video' THEN t.body ~* '\\.(mp4|webm|ogg|mov|m4v)'
                                            WHEN 'image' THEN t.body ~* '\\.(jpe?g|png|webp|gif)'
                                            ELSE (t.body !~* '\\.(mp4|webm|ogg|mov|m4v)' AND t.body !~* '\\.(jpe?g|png|webp|gif)') END))
             ORDER BY t.date DESC`,
      values: [userId || null, filters.q || '', filters.type || null],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async addThreadLike(userId, threadId) {
    const query = {
      text: 'INSERT INTO thread_likes VALUES($1, $2)',
      values: [userId, threadId],
    };

    await this._pool.query(query);
  }

  async deleteThreadLike(userId, threadId) {
    const query = {
      text: 'DELETE FROM thread_likes WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    await this._pool.query(query);
  }

  async checkIsThreadLiked(userId, threadId) {
    const query = {
      text: 'SELECT 1 FROM thread_likes WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async getThreadLikeCount(threadId) {
    const query = {
      text: 'SELECT COUNT(*)::int AS like_count FROM thread_likes WHERE thread_id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].like_count;
  }

  async addBookmark(userId, threadId) {
    const id = `bookmark-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO user_bookmarks VALUES($1, $2, $3)',
      values: [id, userId, threadId],
    };

    await this._pool.query(query);
  }

  async deleteBookmark(userId, threadId) {
    const query = {
      text: 'DELETE FROM user_bookmarks WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    await this._pool.query(query);
  }

  async checkIsThreadBookmarked(userId, threadId) {
    const query = {
      text: 'SELECT 1 FROM user_bookmarks WHERE user_id = $1 AND thread_id = $2',
      values: [userId, threadId],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async verifyThreadOwner(threadId, owner) {
    const query = {
      text: 'SELECT owner FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const thread = result.rows[0];

    if (thread.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getOwnerByThreadId(threadId) {
    const query = {
      text: 'SELECT owner FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0].owner;
  }

  async editThread(threadId, { title, body }) {
    const query = {
      text: 'UPDATE threads SET title = $2, body = $3 WHERE id = $1 RETURNING id, title, body, date',
      values: [threadId, title, body],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
