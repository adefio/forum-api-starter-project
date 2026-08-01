class UpdateUserSettingsUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(userId, settings) {
    const { isPrivate, showAnalytics } = settings;

    if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
      throw new Error('USER_SETTINGS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (showAnalytics !== undefined && typeof showAnalytics !== 'boolean') {
      throw new Error('USER_SETTINGS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    return this._userRepository.updateSettings(userId, { isPrivate, showAnalytics });
  }
}

module.exports = UpdateUserSettingsUseCase;
