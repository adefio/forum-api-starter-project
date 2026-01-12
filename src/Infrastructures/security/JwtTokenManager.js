const jwt = require('jsonwebtoken');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor() {
    super();
  }

  async createAccessToken(payload) {
    // expiresIn mengambil nilai dari environment variable (misal: '1h' atau 3600)
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_AGE,
    });
  }

  async createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  }

  /**
   * Perbaikan: Menambahkan metode verifyAccessToken yang hilang
   * Digunakan oleh authMiddleware untuk memvalidasi access token
   */
  async verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      // Melempar InvariantError jika token expired atau signature tidak valid
      throw new InvariantError('access token tidak valid');
    }
  }

  async verifyRefreshToken(token) {
    try {
      // Memvalidasi signature dan masa berlaku secara otomatis
      return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    // decode mengambil payload tanpa memverifikasi signature
    const payload = jwt.decode(token);
    return payload;
  }
}

module.exports = JwtTokenManager;