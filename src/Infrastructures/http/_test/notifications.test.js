const request = require('supertest');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const addUserAndLogin = async (app, { username, fullname }) => {
  const userResponse = await request(app)
    .post('/users')
    .send({ username, password: 'secret', fullname });

  const loginResponse = await request(app)
    .post('/authentications')
    .send({ username, password: 'secret' });

  return {
    id: userResponse.body.data.addedUser.id,
    username,
    fullname,
    accessToken: loginResponse.body.data.accessToken,
  };
};

const insertNotification = async ({ id, userId, actorId, type }) => {
  const query = {
    text: 'INSERT INTO notifications(id, user_id, actor_id, type, date) VALUES($1, $2, $3, $4, $5)',
    values: [id, userId, actorId, type, new Date().toISOString()],
  };

  await pool.query(query);
};

describe('/notifications endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE notifications, users CASCADE');
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when GET /notifications', () => {
    it('should response 200 and return notifications list', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-123',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });

      // Action
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${userB.accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications).toHaveLength(1);

      const notification = response.body.data.notifications[0];
      expect(notification.id).toBe('notification-123');
      expect(notification.type).toBe('follow');
      expect(notification.isRead).toBe(false);
      expect(notification.date).toBeDefined();
      expect(notification.actor).toEqual({
        id: userA.id,
        username: 'user_a',
        fullname: 'User A',
      });
      expect(notification.thread).toBeNull();
    });

    it('should response 200 and filter notifications by type', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-follow',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });
      await insertNotification({
        id: 'notification-like',
        userId: userB.id,
        actorId: userA.id,
        type: 'like',
      });

      // Action
      const response = await request(app)
        .get('/notifications?type=like')
        .set('Authorization', `Bearer ${userB.accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].id).toBe('notification-like');
    });

    it('should response 200 and default to all when type is not valid', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-follow',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });
      await insertNotification({
        id: 'notification-like',
        userId: userB.id,
        actorId: userA.id,
        type: 'like',
      });

      // Action
      const response = await request(app)
        .get('/notifications?type=invalid')
        .set('Authorization', `Bearer ${userB.accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications).toHaveLength(2);
    });

    it('should response 401 when no access token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/notifications');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('when GET /notifications/unread-count', () => {
    it('should response 200 and return unread count', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-123',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });

      // Action
      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userB.accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.count).toBe(1);
    });

    it('should response 200 and return 0 when no unread notification', async () => {
      // Arrange
      const app = await createServer(container);
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      // Action
      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userB.accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('when PUT /notifications/read', () => {
    it('should response 200 and mark a notification as read', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-123',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });

      // Action
      const response = await request(app)
        .put('/notifications/read')
        .set('Authorization', `Bearer ${userB.accessToken}`)
        .send({ notificationId: 'notification-123' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const countResponse = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userB.accessToken}`);
      expect(countResponse.body.data.count).toBe(0);
    });

    it('should response 200 and mark all notifications as read when no notificationId', async () => {
      // Arrange
      const app = await createServer(container);
      const userA = await addUserAndLogin(app, { username: 'user_a', fullname: 'User A' });
      const userB = await addUserAndLogin(app, { username: 'user_b', fullname: 'User B' });

      await insertNotification({
        id: 'notification-1',
        userId: userB.id,
        actorId: userA.id,
        type: 'follow',
      });
      await insertNotification({
        id: 'notification-2',
        userId: userB.id,
        actorId: userA.id,
        type: 'like',
      });

      // Action
      const response = await request(app)
        .put('/notifications/read')
        .set('Authorization', `Bearer ${userB.accessToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const countResponse = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userB.accessToken}`);
      expect(countResponse.body.data.count).toBe(0);
    });
  });
});
