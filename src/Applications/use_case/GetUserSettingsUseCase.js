class GetUserSettingsUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(userId) {
    return this._userRepository.getSettings(userId);
  }
}

module.exports = GetUserSettingsUseCase;
