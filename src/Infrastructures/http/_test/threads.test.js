const request = require('supertest');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadLikesTableTestHelper = require('../../../../tests/ThreadLikesTableTestHelper');
const UserBookmarksTableTestHelper = require('../../../../tests/UserBookmarksTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadLikesTableTestHelper.cleanTable();
    await UserBookmarksTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = { title: 'sebuah thread', body: 'isi body thread' };
      const app = await createServer(container);

      // Register user
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

      // Login user untuk dapat accessToken
      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret_password',
        });

      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedThread).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const requestPayload = { title: 'sebuah thread', body: 'isi body thread' };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /threads', () => {
    it('should response 200 and return list of threads', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-123' });
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .get('/threads');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.threads).toHaveLength(2);
      expect(response.body.data.threads[0]).toHaveProperty('id');
      expect(response.body.data.threads[0]).toHaveProperty('title');
      expect(response.body.data.threads[0]).toHaveProperty('username');
      expect(response.body.data.threads[0]).toHaveProperty('comment_count');
      expect(response.body.data.threads[0]).toHaveProperty('like_count');
      expect(response.body.data.threads[0]).toHaveProperty('is_liked');
      expect(response.body.data.threads[0]).toHaveProperty('is_bookmarked');
      expect(response.body.data.threads[0]).toHaveProperty('recent_comments');
    });

    it('should response 200 and return empty list when no threads', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .get('/threads');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.threads).toStrictEqual([]);
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.thread).toBeDefined();
    });
  });

  describe('PUT /threads/{threadId}/likes', () => {
    const registerAndLogin = async (app) => {
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret_password',
        });

      return loginResponse.body.data.accessToken;
    };

    it('should response 200 and toggle thread like', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi body thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const firstResponse = await request(app)
        .put(`/threads/${threadId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.status).toBe('success');
      expect(firstResponse.body.data.isLiked).toBe(true);
      expect(firstResponse.body.data.likeCount).toBe(1);

      // Action (toggle kembali)
      const secondResponse = await request(app)
        .put(`/threads/${threadId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.data.isLiked).toBe(false);
      expect(secondResponse.body.data.likeCount).toBe(0);
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123/likes');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      // Action
      const response = await request(app)
        .put('/threads/thread-999/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /threads/{threadId}/bookmarks', () => {
    const registerAndLogin = async (app) => {
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret_password',
        });

      return loginResponse.body.data.accessToken;
    };

    it('should response 200 and toggle bookmark', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi body thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const firstResponse = await request(app)
        .put(`/threads/${threadId}/bookmarks`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.status).toBe('success');
      expect(firstResponse.body.data.isBookmarked).toBe(true);

      // Action (toggle kembali)
      const secondResponse = await request(app)
        .put(`/threads/${threadId}/bookmarks`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.data.isBookmarked).toBe(false);
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123/bookmarks');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /threads/{threadId}', () => {
    const registerAndLogin = async (app) => {
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret_password',
        });

      return loginResponse.body.data.accessToken;
    };

    it('should response 200 and update thread', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi body thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul baru', body: 'isi baru' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.thread.title).toBe('judul baru');
      expect(response.body.data.thread.body).toBe('isi baru');
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123')
        .send({ title: 'judul baru', body: 'isi baru' });

      // Assert
      expect(response.status).toBe(401);
    });

    it('should response 403 when editing thread owned by other user', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi body thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Register user lain
      await request(app)
        .post('/users')
        .send({
          username: 'johndoe',
          password: 'secret_password',
          fullname: 'John Doe',
        });

      const otherLoginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'johndoe',
          password: 'secret_password',
        });

      const otherAccessToken = otherLoginResponse.body.data.accessToken;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({ title: 'judul baru', body: 'isi baru' });

      // Assert
      expect(response.status).toBe(403);
    });
  });
});
