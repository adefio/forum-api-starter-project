const PasswordHash = require('../../Applications/security/PasswordHash');
const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');

class BcryptPasswordHash extends PasswordHash {
  constructor(bcrypt) {
    super();
    this._bcrypt = bcrypt;
  }

  async hash(password) {
    return this._bcrypt.hash(password, 10);
  }

  // --- PERBAIKAN DI SINI ---
  // Pastikan nama methodnya 'comparePassword' agar sesuai dengan Abstract Class-nya
  async comparePassword(plain, encrypted) {
    const result = await this._bcrypt.compare(plain, encrypted);

    if (!result) {
      throw new AuthenticationError('kredensial yang Anda masukkan salah');
    }
  }
}

module.exports = BcryptPasswordHash;