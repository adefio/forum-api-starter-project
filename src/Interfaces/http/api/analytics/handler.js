const GetPostAnalyticsUseCase = require('../../../../Applications/use_case/GetPostAnalyticsUseCase');
const GetProfileAnalyticsUseCase = require('../../../../Applications/use_case/GetProfileAnalyticsUseCase');

class AnalyticsHandler {
  constructor(container) {
    this._container = container;

    this.getPostAnalyticsHandler = this.getPostAnalyticsHandler.bind(this);
    this.getProfileAnalyticsHandler = this.getProfileAnalyticsHandler.bind(this);
  }

  async getPostAnalyticsHandler(req, res, next) {
    try {
      const getPostAnalyticsUseCase = this._container.getInstance(GetPostAnalyticsUseCase.name);
      const { threadId } = req.params;
      const { id: credentialId } = req.auth;

      const analytics = await getPostAnalyticsUseCase.execute(threadId, credentialId);

      res.status(200).json({
        status: 'success',
        data: {
          analytics,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileAnalyticsHandler(req, res, next) {
    try {
      const getProfileAnalyticsUseCase = this._container.getInstance(GetProfileAnalyticsUseCase.name);
      const { id: credentialId } = req.auth;

      const analytics = await getProfileAnalyticsUseCase.execute(credentialId);

      res.status(200).json({
        status: 'success',
        data: {
          analytics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsHandler;
