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

      // Setup data via API calls to ensure consistency
      const threadRes = await server.inject({
        method: 'POST', url: '/threads', payload: { title: 't', body: 'b' }, headers: { Authorization: `Bearer ${token}` }
      });
      const threadId = JSON.parse(threadRes.payload).data.addedThread.id;

      const commentRes = await server.inject({
        method: 'POST', url: `/threads/${threadId}/comments`, payload: { content: 'c' }, headers: { Authorization: `Bearer ${token}` }
      });
      const commentId = JSON.parse(commentRes.payload).data.addedComment.id;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'sebuah balasan' },
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });
});