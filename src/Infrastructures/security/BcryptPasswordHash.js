const PasswordHash = require('../../Applications/security/PasswordHash');
const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');
const bcrypt = require('bcrypt');

class BcryptPasswordHash extends PasswordHash {
  constructor(bcrypt) {
    super();
    this._bcrypt = bcrypt;
  }

  async hash(password) {
    return this._bcrypt.hash(password, 10);
  }

  async compare(password, encryptedPassword) {
    const result = await this._bcrypt.compare(password, encryptedPassword);

    if (!result) {
      throw new AuthenticationError('kredensial yang Anda masukkan salah');
    }
  }
}

module.exports = BcryptPasswordHash;