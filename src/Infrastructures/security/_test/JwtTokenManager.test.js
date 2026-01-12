const jwt = require('jsonwebtoken'); // Gunakan jsonwebtoken untuk memverifikasi hasil di Assert
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  // 1. Simpan nilai asli environment variable (Cleanup)
  const originalAccessTokenKey = process.env.ACCESS_TOKEN_KEY;
  const originalRefreshTokenKey = process.env.REFRESH_TOKEN_KEY;
  const originalAccessTokenAge = process.env.ACCESS_TOKEN_AGE;

  beforeAll(() => {
    // 2. Set nilai dummy khusus untuk pengujian unit
    process.env.ACCESS_TOKEN_KEY = 'secret_access_key';
    process.env.REFRESH_TOKEN_KEY = 'secret_refresh_key';
    process.env.ACCESS_TOKEN_AGE = '1h'; // jsonwebtoken butuh nilai umur token
  });

  afterAll(() => {
    // 3. Kembalikan ke nilai asli (Cleanup)
    process.env.ACCESS_TOKEN_KEY = originalAccessTokenKey;
    process.env.REFRESH_TOKEN_KEY = originalRefreshTokenKey;
    process.env.ACCESS_TOKEN_AGE = originalAccessTokenAge;
  });

  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(typeof accessToken).toBe('string');
      // Verifikasi manual menggunakan jsonwebtoken untuk memastikan key yang digunakan benar
      const decoded = jwt.verify(accessToken, 'secret_access_key');
      expect(decoded.username).toEqual(payload.username);
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(typeof refreshToken).toBe('string');
      // Verifikasi manual untuk memastikan key yang digunakan benar
      const decoded = jwt.verify(refreshToken, 'secret_refresh_key');
      expect(decoded.username).toEqual(payload.username);
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when refresh token is invalid', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager();

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken('invalid_token'))
        .rejects
        .toThrow(InvariantError);
    });

    it('should throw InvariantError when verification failed (using access token key to verify)', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager();
      // Buat token menggunakan Access Key, tapi nanti akan diverifikasi menggunakan Refresh Key
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager();
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(refreshToken))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const payload = { username: 'dicoding' };
      const jwtTokenManager = new JwtTokenManager();
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Action
      const decodedPayload = await jwtTokenManager.decodePayload(accessToken);

      // Assert
      expect(decodedPayload.username).toEqual(payload.username);
    });
  });
});