const request = require('supertest');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
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
          fullname: 'Dicoding Indonesia' 
        });

      // Login user untuk dapat accessToken
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ 
          username: 'dicoding', 
          password: 'secret_password' 
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
});