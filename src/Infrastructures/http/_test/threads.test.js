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
      const requestPayload = { title: 'sebuah thread', body: 'isi body thread' };
      const server = await createServer(container);

      // Register & Login user untuk dapat accessToken
      await server.inject({
        method: 'POST', url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' },
      });
      const loginResponse = await server.inject({
        method: 'POST', url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'POST', url: '/threads', payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      const requestPayload = { title: 'sebuah thread', body: 'isi body thread' };
      const server = await createServer(container);
      const response = await server.inject({ method: 'POST', url: '/threads', payload: requestPayload });
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      const server = await createServer(container);

      const response = await server.inject({ method: 'GET', url: `/threads/${threadId}` });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});