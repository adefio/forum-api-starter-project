const jwt = require('jsonwebtoken');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  const originalAccessTokenKey = process.env.ACCESS_TOKEN_KEY;
  const originalRefreshTokenKey = process.env.REFRESH_TOKEN_KEY;
  const originalAccessTokenAge = process.env.ACCESS_TOKEN_AGE;

  beforeAll(() => {
    process.env.ACCESS_TOKEN_KEY = 'secret_access_key';
    process.env.REFRESH_TOKEN_KEY = 'secret_refresh_key';
    process.env.ACCESS_TOKEN_AGE = '1h';
  });

  afterAll(() => {
    process.env.ACCESS_TOKEN_KEY = originalAccessTokenKey;
    process.env.REFRESH_TOKEN_KEY = originalRefreshTokenKey;
    process.env.ACCESS_TOKEN_AGE = originalAccessTokenAge;
  });

  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();

      const accessToken = await jwtTokenManager.createAccessToken(payload);

      expect(typeof accessToken).toBe('string');
      const decoded = jwt.verify(accessToken, 'secret_access_key');
      expect(decoded.username).toEqual(payload.username);
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();

      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      expect(typeof refreshToken).toBe('string');
      const decoded = jwt.verify(refreshToken, 'secret_refresh_key');
      expect(decoded.username).toEqual(payload.username);
    });
  });

  /**
   * PENGUJIAN BARU: verifyAccessToken function
   * Memastikan sinkronisasi dengan metode baru di JwtTokenManager.js
   */
  describe('verifyAccessToken function', () => {
    it('should throw InvariantError when access token is invalid', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager();

      // Action & Assert
      await expect(jwtTokenManager.verifyAccessToken('invalid_token'))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when access token is valid', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager();
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyAccessToken(accessToken))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when refresh token is invalid', async () => {
      const jwtTokenManager = new JwtTokenManager();

      await expect(jwtTokenManager.verifyRefreshToken('invalid_token'))
        .rejects
        .toThrow(InvariantError);
    });

    it('should throw InvariantError when verification failed (using access token key to verify)', async () => {
      const jwtTokenManager = new JwtTokenManager();
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      const jwtTokenManager = new JwtTokenManager();
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'dicoding' });

      await expect(jwtTokenManager.verifyRefreshToken(refreshToken))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      const decodedPayload = await jwtTokenManager.decodePayload(accessToken);

      expect(decodedPayload.username).toEqual(payload.username);
    });
  });
});