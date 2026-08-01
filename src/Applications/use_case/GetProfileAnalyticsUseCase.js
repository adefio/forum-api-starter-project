class GetProfileAnalyticsUseCase {
  constructor({ analyticsRepository, userRepository }) {
    this._analyticsRepository = analyticsRepository;
    this._userRepository = userRepository;
  }

  async execute(userId) {
    await this._userRepository.findById(userId);

    return this._analyticsRepository.getProfileAnalytics(userId);
  }
}

module.exports = GetProfileAnalyticsUseCase;
