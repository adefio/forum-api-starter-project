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

      // Persiapan data: User, Thread, dan Comment
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: 'user-123' });

      // Login untuk mendapatkan token
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists('user-123', commentId);
      expect(likes).toHaveLength(1); // Like berhasil ditambahkan
    });

    it('should response 200 and remove like when comment is already liked (unlike)', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: 'user-123' });
      
      // Kondisi awal: Sudah memberikan like
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId });

      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = loginResponse.body.data;

      // Action: Panggil lagi endpoint yang sama
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists('user-123', commentId);
      expect(likes).toHaveLength(0); // Like berhasil dihapus (unlike)
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      
      const loginResponse = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = loginResponse.body.data;

      // Action: Menggunakan ID yang tidak ada di database
      const response = await request(app)
        .put('/threads/invalid-thread/comments/invalid-comment/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});