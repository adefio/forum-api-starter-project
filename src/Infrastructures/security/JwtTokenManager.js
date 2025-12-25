const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    // Memastikan payload ditandatangani dengan Access Token Key
    return this._jwt.generate(payload, process.env.ACCESS_TOKEN_KEY);
  }

  async createRefreshToken(payload) {
    // Memastikan payload ditandatangani dengan Refresh Token Key
    return this._jwt.generate(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyRefreshToken(token) {
    try {
      // Decode token untuk mendapatkan struktur artifacts
      const artifacts = this._jwt.decode(token);
      
      // Verifikasi signature menggunakan Refresh Token Key
      this._jwt.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      // Jika signature tidak cocok atau token kadaluarsa, lempar InvariantError
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    // Mengambil payload tanpa melakukan verifikasi signature (biasanya untuk kebutuhan akses cepat)
    const artifacts = this._jwt.decode(token);
    return artifacts.decoded.payload;
  }
}

module.exports = JwtTokenManager;