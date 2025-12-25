const Jwt = require('@hapi/jwt');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  // 1. Simpan nilai asli dari environment variable agar bisa dikembalikan nanti (Cleanup)
  const originalAccessTokenKey = process.env.ACCESS_TOKEN_KEY;
  const originalRefreshTokenKey = process.env.REFRESH_TOKEN_KEY;

  beforeAll(() => {
    // 2. Set nilai dummy khusus untuk pengujian unit agar tidak bergantung pada file .env
    process.env.ACCESS_TOKEN_KEY = 'secret_access_key';
    process.env.REFRESH_TOKEN_KEY = 'secret_refresh_key';
  });

  afterAll(() => {
    // 3. Kembalikan ke nilai asli agar tidak merusak pengujian di file lain (mencegah kebocoran global)
    process.env.ACCESS_TOKEN_KEY = originalAccessTokenKey;
    process.env.REFRESH_TOKEN_KEY = originalRefreshTokenKey;
  });

  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = { username: 'dicoding' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      // 4. Pastikan menggunakan nilai kunci yang kita set di beforeAll secara eksplisit
      expect(mockJwtToken.generate).toBeCalledWith(payload, 'secret_access_key');
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = { username: 'dicoding' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, 'secret_refresh_key');
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed (using access token)', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      
      // Access token dibuat dengan ACCESS_TOKEN_KEY ('secret_access_key')
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
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
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action
      // 5. Gunakan penamaan actualUsername untuk menampung hasil eksekusi
      const { username: actualUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Assert
      expect(actualUsername).toEqual('dicoding');
    });
  });
});