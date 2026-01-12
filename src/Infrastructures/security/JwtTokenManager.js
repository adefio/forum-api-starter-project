const jwt = require('jsonwebtoken');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor() {
    super();
  }

  async createAccessToken(payload) {
    // expiresIn mengambil nilai dari environment variable (misal: 3600 atau '1h')
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_AGE,
    });
  }

  async createRefreshToken(payload) {
    // Refresh token biasanya memiliki masa berlaku yang sangat lama atau tidak diatur di sini
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyRefreshToken(token) {
    try {
      // jsonwebtoken.verify akan memvalidasi signature dan masa berlaku secara otomatis
      return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      // Jika token expired, signature salah, atau format rusak, lempar InvariantError
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