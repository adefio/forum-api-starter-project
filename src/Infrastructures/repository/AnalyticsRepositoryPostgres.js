const AnalyticsRepository = require('../../Domains/analytics/AnalyticsRepository');

class AnalyticsRepositoryPostgres extends AnalyticsRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getPostAnalytics(threadId) {
    const titleQuery = {
      text: 'SELECT title FROM threads WHERE id = $1',
      values: [threadId],
    };

    const likeQuery = {
      text: 'SELECT COUNT(*)::int AS count FROM thread_likes WHERE thread_id = $1',
      values: [threadId],
    };

    const commentQuery = {
      text: 'SELECT COUNT(*)::int AS count FROM comments WHERE thread_id = $1',
      values: [threadId],
    };

    const replyQuery = {
      text: `SELECT COUNT(*)::int AS count
             FROM replies
             JOIN comments ON replies.comment_id = comments.id
             WHERE comments.thread_id = $1`,
      values: [threadId],
    };

    const recentLikesQuery = {
      text: `SELECT users.username
             FROM thread_likes
             JOIN users ON users.id = thread_likes.user_id
             WHERE thread_likes.thread_id = $1
             ORDER BY users.username
             LIMIT 5`,
      values: [threadId],
    };

    const [titleResult, likeResult, commentResult, replyResult, recentLikesResult] =
      await Promise.all([
        this._pool.query(titleQuery),
        this._pool.query(likeQuery),
        this._pool.query(commentQuery),
        this._pool.query(replyQuery),
        this._pool.query(recentLikesQuery),
      ]);

    return {
      threadId,
      title: titleResult.rows[0].title,
      likeCount: likeResult.rows[0].count,
      commentCount: commentResult.rows[0].count,
      replyCount: replyResult.rows[0].count,
      recentLikes: recentLikesResult.rows.map((row) => row.username),
    };
  }

  async getProfileAnalytics(userId) {
    const totalPostsQuery = {
      text: 'SELECT COUNT(*)::int AS count FROM threads WHERE owner = $1',
      values: [userId],
    };

    const totalLikesQuery = {
      text: `SELECT COUNT(*)::int AS count
             FROM thread_likes
             JOIN threads ON threads.id = thread_likes.thread_id
             WHERE threads.owner = $1`,
      values: [userId],
    };

    const totalCommentsQuery = {
      text: `SELECT COUNT(*)::int AS count
             FROM comments
             JOIN threads ON threads.id = comments.thread_id
             WHERE threads.owner = $1`,
      values: [userId],
    };

    const totalRepliesQuery = {
      text: `SELECT COUNT(*)::int AS count
             FROM replies
             JOIN comments ON replies.comment_id = comments.id
             JOIN threads ON threads.id = comments.thread_id
             WHERE threads.owner = $1`,
      values: [userId],
    };

    const followerCountQuery = {
      text: 'SELECT COUNT(*)::int AS count FROM user_follows WHERE followed_id = $1',
      values: [userId],
    };

    const followingCountQuery = {
      text: 'SELECT COUNT(*)::int AS count FROM user_follows WHERE follower_id = $1',
      values: [userId],
    };

    const last7DaysLikesQuery = {
      text: `SELECT to_char(day, 'YYYY-MM-DD') AS date, COALESCE(l.count, 0) AS count
             FROM generate_series(current_date - 6, current_date, '1 day') AS day
             LEFT JOIN (
               SELECT (threads.date)::date AS d, COUNT(*)::int AS count
               FROM thread_likes
               JOIN threads ON threads.id = thread_likes.thread_id
               WHERE threads.owner = $1
                 AND (threads.date)::date BETWEEN current_date - 6 AND current_date
               GROUP BY (threads.date)::date
             ) l ON l.d = day
             ORDER BY day ASC`,
      values: [userId],
    };

    const last7DaysCommentsQuery = {
      text: `SELECT to_char(day, 'YYYY-MM-DD') AS date, COALESCE(c.count, 0) AS count
             FROM generate_series(current_date - 6, current_date, '1 day') AS day
             LEFT JOIN (
               SELECT (comments.date)::date AS d, COUNT(*)::int AS count
               FROM comments
               JOIN threads ON threads.id = comments.thread_id
               WHERE threads.owner = $1
                 AND (comments.date)::date BETWEEN current_date - 6 AND current_date
               GROUP BY (comments.date)::date
             ) c ON c.d = day
             ORDER BY day ASC`,
      values: [userId],
    };

    const [
      totalPostsResult,
      totalLikesResult,
      totalCommentsResult,
      totalRepliesResult,
      followerCountResult,
      followingCountResult,
      last7DaysLikesResult,
      last7DaysCommentsResult,
    ] = await Promise.all([
      this._pool.query(totalPostsQuery),
      this._pool.query(totalLikesQuery),
      this._pool.query(totalCommentsQuery),
      this._pool.query(totalRepliesQuery),
      this._pool.query(followerCountQuery),
      this._pool.query(followingCountQuery),
      this._pool.query(last7DaysLikesQuery),
      this._pool.query(last7DaysCommentsQuery),
    ]);

    const totalPosts = totalPostsResult.rows[0].count;
    const totalLikes = totalLikesResult.rows[0].count;
    const totalComments = totalCommentsResult.rows[0].count;

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalReplies: totalRepliesResult.rows[0].count,
      followerCount: followerCountResult.rows[0].count,
      followingCount: followingCountResult.rows[0].count,
      last7Days: {
        likes: last7DaysLikesResult.rows,
        comments: last7DaysCommentsResult.rows,
        followers: [],
      },
      insights: {
        engagementRate: totalPosts > 0
          ? Number(((totalLikes + totalComments) / totalPosts).toFixed(2))
          : 0,
      },
    };
  }
}

module.exports = AnalyticsRepositoryPostgres;
