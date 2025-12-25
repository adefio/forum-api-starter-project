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
      const server = await createServer(container);
      
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' },
      });
      const authRes = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const token = JSON.parse(authRes.payload).data.accessToken;

      const threadRes = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 't', body: 'b' },
        headers: { Authorization: `Bearer ${token}` },
      });
      const { id: threadId } = JSON.parse(threadRes.payload).data.addedThread;

      const commentRes = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah komentar' },
        headers: { Authorization: `Bearer ${token}` },
      });
      const { id: commentId } = JSON.parse(commentRes.payload).data.addedComment;

      const requestPayload = { content: 'sebuah balasan' };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });

    it('should response 400 when payload bad request', async () => {
      // Arrange
      const server = await createServer(container);
      await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' },
      });
      const authRes = await server.inject({
        method: 'POST', url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const token = JSON.parse(authRes.payload).data.accessToken;

      // Setup: Buat thread dan komentar asli agar lolos pengecekan keberadaan (404)
      const threadRes = await server.inject({
        method: 'POST', url: '/threads', payload: { title: 't', body: 'b' }, headers: { Authorization: `Bearer ${token}` }
      });
      const { id: threadId } = JSON.parse(threadRes.payload).data.addedThread;

      const commentRes = await server.inject({
        method: 'POST', url: `/threads/${threadId}/comments`, payload: { content: 'c' }, headers: { Authorization: `Bearer ${token}` }
      });
      const { id: commentId } = JSON.parse(commentRes.payload).data.addedComment;

      // Action: Payload kosong
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {}, 
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 when missing authentication', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: { content: 'balasan' },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply correctly', async () => {
      // Arrange
      const server = await createServer(container);
      
      // Setup User via API agar password terenkripsi dengan benar
      const userRes = await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' },
      });
      const { id: userId } = JSON.parse(userRes.payload).data.addedUser;

      const authRes = await server.inject({
        method: 'POST', url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const token = JSON.parse(authRes.payload).data.accessToken;

      // Setup data menggunakan helper dengan ID user yang tepat
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const server = await createServer(container);
      
      // Setup dua user via API
      const ownerRes = await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'owner', password: 'secret_password', fullname: 'Owner' },
      });
      const { id: ownerId } = JSON.parse(ownerRes.payload).data.addedUser;

      const thiefRes = await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'thief', password: 'secret_password', fullname: 'Thief' },
      });
      const authRes = await server.inject({
        method: 'POST', url: '/authentications',
        payload: { username: 'thief', password: 'secret_password' },
      });
      const thiefToken = JSON.parse(authRes.payload).data.accessToken;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: ownerId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: ownerId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${thiefToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 404 when reply does not exist', async () => {
      // Arrange
      const server = await createServer(container);
      await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding' },
      });
      const authRes = await server.inject({
        method: 'POST', url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const token = JSON.parse(authRes.payload).data.accessToken;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-fake',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });
});