/* src/Infrastructures/repository/UserRepositoryPostgres.js */
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const RegisteredUser = require('../../Domains/users/entities/RegisteredUser');
const UserRepository = require('../../Domains/users/UserRepository');

class UserRepositoryPostgres extends UserRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyAvailableUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError('username tidak tersedia');
    }
  }

  async addUser(registerUser) {
    const { username, password, fullname } = registerUser;
    const id = `user-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname',
      values: [id, username, password, fullname],
    };

    const result = await this._pool.query(query);

    return new RegisteredUser({ ...result.rows[0] });
  }

  async getPasswordByUsername(username) {
    const query = {
      text: 'SELECT password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('username tidak ditemukan');
    }

    return result.rows[0].password;
  }

  async getIdByUsername(username) {
    const query = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('user tidak ditemukan');
    }

    const { id } = result.rows[0];
    return id;
  }

  async getProfileByUsername(username, currentUserId) {
    const query = {
      text: `SELECT u.id, u.username, u.fullname,
                    (SELECT COUNT(*)::int FROM user_follows f WHERE f.followed_id = u.id) AS follower_count,
                    (SELECT COUNT(*)::int FROM user_follows f WHERE f.follower_id = u.id) AS following_count,
                    (SELECT COUNT(*)::int FROM threads t WHERE t.owner = u.id) AS thread_count,
                    EXISTS(SELECT 1 FROM user_follows f WHERE f.follower_id = $2 AND f.followed_id = u.id) AS is_following
             FROM users u
             WHERE u.username = $1`,
      values: [username, currentUserId || null],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('user tidak ditemukan');
    }

    const { is_following: isFollowing, ...profile } = result.rows[0];
    return { ...profile, isFollowing };
  }

  async getUserByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('user tidak ditemukan');
    }

    return result.rows[0];
  }

  async followUser(followerId, followedId) {
    const query = {
      text: 'INSERT INTO user_follows VALUES($1, $2) ON CONFLICT DO NOTHING',
      values: [followerId, followedId],
    };

    await this._pool.query(query);
  }

  async unfollowUser(followerId, followedId) {
    const query = {
      text: 'DELETE FROM user_follows WHERE follower_id = $1 AND followed_id = $2',
      values: [followerId, followedId],
    };

    await this._pool.query(query);
  }

  async getUsers(queryKeyword, currentUserId) {
    const query = {
      text: `SELECT u.id, u.username, u.fullname,
                    EXISTS(SELECT 1 FROM user_follows f
                           WHERE f.follower_id = $2 AND f.followed_id = u.id) AS is_following
             FROM users u
              WHERE ($2 IS NULL OR u.id <> $2)
                AND ($1 = '' OR u.username ILIKE '%' || $1 || '%' OR u.fullname ILIKE '%' || $1 || '%')
             ORDER BY u.username
             LIMIT 50`,
      values: [queryKeyword || '', currentUserId || null],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => {
      const { is_following: isFollowing, ...user } = row;
      return { ...user, isFollowing };
    });
  }

  async getFollowers(username, currentUserId) {
    const query = {
      text: `SELECT u.id, u.username, u.fullname,
                    EXISTS(SELECT 1 FROM user_follows f
                           WHERE f.follower_id = $2 AND f.followed_id = u.id) AS is_following
             FROM user_follows f
             JOIN users u ON u.id = f.follower_id
             WHERE f.followed_id = (SELECT id FROM users WHERE username = $1)
             ORDER BY u.username`,
      values: [username, currentUserId || null],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => {
      const { is_following: isFollowing, ...user } = row;
      return { ...user, isFollowing };
    });
  }

  async getFollowing(username, currentUserId) {
    const query = {
      text: `SELECT u.id, u.username, u.fullname,
                    EXISTS(SELECT 1 FROM user_follows f
                           WHERE f.follower_id = $2 AND f.followed_id = u.id) AS is_following
             FROM user_follows f
             JOIN users u ON u.id = f.followed_id
             WHERE f.follower_id = (SELECT id FROM users WHERE username = $1)
             ORDER BY u.username`,
      values: [username, currentUserId || null],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => {
      const { is_following: isFollowing, ...user } = row;
      return { ...user, isFollowing };
    });
  }
}

module.exports = UserRepositoryPostgres;