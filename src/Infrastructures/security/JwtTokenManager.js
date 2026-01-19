/* src/Infrastructures/security/JwtTokenManager.js */
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const jwt = require('jsonwebtoken');

class JwtTokenManager extends AuthenticationTokenManager {
  async createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_AGE || '1h',
    });
  }

  async createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_AGE || '7d',
    });
  }

  async verifyAccessToken(token) {
    try {
      const artifacts = jwt.decode(token);
      // PERBAIKAN: verify harus me-return payload yang sudah didecode
      return jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('access token tidak valid');
    }
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = jwt.decode(token);
      return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
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