const request = require('supertest');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikesTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 when like comment for the first time', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);

      // PERBAIKAN: Register via API agar password di-hash
      const userResponse = await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });
      const { id: userId } = userResponse.body.data.addedUser;

      // Gunakan userId yang baru dibuat untuk Thread dan Comment
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Login (sekarang akan berhasil karena password di DB valid/hashed)
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists(userId, commentId);
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and remove like when comment is already liked (unlike)', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);

      // PERBAIKAN: Register via API
      const userResponse = await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });
      const { id: userId } = userResponse.body.data.addedUser;

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      
      // Simulasikan like awal
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', userId, commentId });

      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists(userId, commentId);
      expect(likes).toHaveLength(0);
    });

    it('should response 401 when request without authentication', async () => {
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);

      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`);

      expect(response.status).toBe(401);
    });

    it('should response 404 when thread or comment not found', async () => {
      const app = await createServer(container);
      
      // Register & Login untuk dapat token valid
      await request(app)
        .post('/users')
        .send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
        
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginResponse.body.data;

      const response = await request(app)
        .put('/threads/invalid-thread/comments/invalid-comment/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});