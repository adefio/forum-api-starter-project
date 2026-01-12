const request = require('supertest');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('/authentications endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);
      
      // add user
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'wrong_password',
      };
      const app = await createServer(container);
      
      // Add user
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      // Arrange
      const requestPayload = {
        username: 123,
        password: 'secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      // Arrange
      const app = await createServer(container);
      
      // add user
      await request(app)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });
        
      // login user
      const loginResponse = await request(app)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret',
        });
      const { refreshToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .put('/authentications')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/authentications')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/authentications')
        .send({ refreshToken: 123 });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/authentications')
        .send({ refreshToken: 'invalid_refresh_token' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const refreshToken = await tokenManager.createRefreshToken({ username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/authentications')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      // Arrange
      const app = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      // Action
      const response = await request(app)
        .delete('/authentications')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      // Arrange
      const app = await createServer(container);
      const refreshToken = 'refresh_token';

      // Action
      const response = await request(app)
        .delete('/authentications')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete('/authentications')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('harus mengirimkan token refresh');
    });

    it('should response 400 if refresh token not string', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete('/authentications')
        .send({ refreshToken: 123 });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('refresh token harus string');
    });
  });
});