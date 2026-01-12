const request = require('supertest');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const app = await createServer(container);

      // 1. Register User
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

      // 2. Login User
      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret_password',
        });

      const { accessToken } = loginResponse.body.data;

      // 3. Add Thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body thread',
        });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah comment',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedComment).toBeDefined();
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200', async () => {
      // Arrange
      const app = await createServer(container);

      // 1. Register & Login
      await request(app)
        .post('/users')
        .send({ 
          username: 'dicoding', 
          password: 'secret_password', 
          fullname: 'Dicoding Indonesia' 
        });
        
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ 
          username: 'dicoding', 
          password: 'secret_password' 
        });
        
      const { accessToken } = loginResponse.body.data;

      // 2. Add Thread
      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 't', body: 'b' });
        
      const threadId = threadRes.body.data.addedThread.id;

      // 3. Add Comment
      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'c' });
        
      const commentId = commentRes.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});