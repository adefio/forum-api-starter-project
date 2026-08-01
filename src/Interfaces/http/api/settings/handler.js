const GetUserSettingsUseCase = require('../../../../Applications/use_case/GetUserSettingsUseCase');
const UpdateUserSettingsUseCase = require('../../../../Applications/use_case/UpdateUserSettingsUseCase');

class SettingsHandler {
  constructor(container) {
    this._container = container;

    this.getSettingsHandler = this.getSettingsHandler.bind(this);
    this.putSettingsHandler = this.putSettingsHandler.bind(this);
  }

  async getSettingsHandler(req, res, next) {
    try {
      const getUserSettingsUseCase = this._container.getInstance(GetUserSettingsUseCase.name);
      const { id: credentialId } = req.auth;

      const settings = await getUserSettingsUseCase.execute(credentialId);

      res.status(200).json({
        status: 'success',
        data: {
          settings,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putSettingsHandler(req, res, next) {
    try {
      const updateUserSettingsUseCase = this._container.getInstance(UpdateUserSettingsUseCase.name);
      const { id: credentialId } = req.auth;

      const settings = await updateUserSettingsUseCase.execute(credentialId, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          settings,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsHandler;
