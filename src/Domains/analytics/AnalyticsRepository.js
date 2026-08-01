class AnalyticsRepository {
  async getPostAnalytics(threadId) {
    throw new Error('ANALYTICS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getProfileAnalytics(userId) {
    throw new Error('ANALYTICS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = AnalyticsRepository;
