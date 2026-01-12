const request = require('supertest');
const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const app = await createServer(container);
      
      await request(app)
        .post('/users')
        .send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' });
        
      const authRes = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
        
      const { accessToken } = authRes.body.data;

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 't', body: 'b' });
        
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });
        
      const { id: commentId } = commentRes.body.data.addedComment;

      const requestPayload = { content: 'sebuah balasan' };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toBe(requestPayload.content);
    });

    it('should response 400 when payload bad request', async () => {
      // Arrange
      const app = await createServer(container);
      
      await request(app)
        .post('/users')
        .send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' });
        
      const authRes = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
        
      const { accessToken } = authRes.body.data;

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 't', body: 'b' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'c' });
      const { id: commentId } = commentRes.body.data.addedComment;

      // Action: Payload kosong
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should response 401 when missing authentication', async () => {
      const app = await createServer(container);
      
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'balasan' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply correctly', async () => {
      // Arrange
      const app = await createServer(container);
      
      const userRes = await request(app)
        .post('/users')
        .send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' });
      const { id: userId } = userRes.body.data.addedUser;

      const authRes = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = authRes.body.data;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const app = await createServer(container);
      
      const ownerRes = await request(app)
        .post('/users')
        .send({ username: 'owner', password: 'secret_password', fullname: 'Owner' });
      const { id: ownerId } = ownerRes.body.data.addedUser;

      await request(app)
        .post('/users')
        .send({ username: 'thief', password: 'secret_password', fullname: 'Thief' });
        
      const authRes = await request(app)
        .post('/authentications')
        .send({ username: 'thief', password: 'secret_password' });
      const { accessToken: thiefToken } = authRes.body.data;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: ownerId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: ownerId });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${thiefToken}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should response 404 when reply does not exist', async () => {
      // Arrange
      const app = await createServer(container);
      
      await request(app)
        .post('/users')
        .send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' });
        
      const authRes = await request(app)
        .post('/authentications')
        .send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = authRes.body.data;

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-fake')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});