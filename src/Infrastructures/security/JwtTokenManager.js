const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const jwt = require('jsonwebtoken');

class JwtTokenManager extends AuthenticationTokenManager {
  async createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      // PERBAIKAN: Fallback ke '1h' jika env variable tidak terbaca saat tes
      expiresIn: process.env.ACCESS_TOKEN_AGE || '1h',
    });
  }

  async createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_AGE || '7d',
    });
  }

  // PERBAIKAN: Metode ini WAJIB ada agar authMiddleware berfungsi
  async verifyAccessToken(token) {
    try {
      const artifacts = jwt.decode(token);
      jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('access token tidak valid');
    }
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = jwt.decode(token);
      jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = jwt.decode(token);
    return artifacts;
  }
}

module.exports = JwtTokenManager;