class GetPostAnalyticsUseCase {
  constructor({ analyticsRepository, threadRepository }) {
    this._analyticsRepository = analyticsRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, userId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadRepository.verifyThreadOwner(threadId, userId);

    return this._analyticsRepository.getPostAnalytics(threadId);
  }
}

module.exports = GetPostAnalyticsUseCase;
