const request = require('supertest');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const registerAndLogin = async (app, username = 'dicoding') => {
  const userResponse = await request(app)
    .post('/users')
    .send({ username, password: 'secret', fullname: 'Dicoding Indonesia' });
  if (userResponse.status !== 201) {
    throw new Error(`REGISTER FAILED (${userResponse.status}): ${JSON.stringify(userResponse.body)}`);
  }

  const loginResponse = await request(app)
    .post('/authentications')
    .send({ username, password: 'secret' });

  if (loginResponse.status !== 201) {
    throw new Error(`LOGIN FAILED (${loginResponse.status}): ${JSON.stringify(loginResponse.body)}`);
  }

  return loginResponse.body.data.accessToken;
};

describe('/analytics and /settings endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('GET /analytics/posts/:threadId', () => {
    it('should return zero analytics for thread without any interaction', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .get(`/analytics/posts/${threadId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toStrictEqual({
        threadId,
        title: 'sebuah thread',
        likeCount: 0,
        commentCount: 0,
        replyCount: 0,
        recentLikes: [],
      });
    });

    it('should response 403 when requester is not the thread owner', async () => {
      // Arrange
      const app = await createServer(container);
      const ownerAccessToken = await registerAndLogin(app, 'owner');
      const otherAccessToken = await registerAndLogin(app, 'other');

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .get(`/analytics/posts/${threadId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/analytics/posts/thread-123');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /analytics/profile', () => {
    it('should return profile analytics with totalPosts at least 1', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      // Action
      const response = await request(app)
        .get('/analytics/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics.totalPosts).toBeGreaterThanOrEqual(1);
      expect(response.body.data.analytics.totalLikes).toBe(0);
      expect(response.body.data.analytics.totalComments).toBe(0);
      expect(response.body.data.analytics.totalReplies).toBe(0);
      expect(response.body.data.analytics.last7Days).toHaveProperty('likes');
      expect(response.body.data.analytics.last7Days.likes).toHaveLength(7);
      expect(response.body.data.analytics.last7Days.comments).toHaveLength(7);
      expect(response.body.data.analytics.last7Days.followers).toEqual([]);
      expect(response.body.data.analytics.insights).toHaveProperty('engagementRate');
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/analytics/profile');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /settings', () => {
    it('should return default settings when no row exists', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      // Action
      const response = await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.settings).toStrictEqual({ isPrivate: false, showAnalytics: true });
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/settings');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /settings', () => {
    it('should update settings and persist them', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      // Action
      const putResponse = await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isPrivate: true });

      // Assert
      expect(putResponse.status).toBe(200);
      expect(putResponse.body.status).toBe('success');
      expect(putResponse.body.data.settings).toStrictEqual({ isPrivate: true, showAnalytics: true });

      const getResponse = await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getResponse.body.data.settings).toStrictEqual({ isPrivate: true, showAnalytics: true });
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).put('/settings').send({ isPrivate: true });

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
