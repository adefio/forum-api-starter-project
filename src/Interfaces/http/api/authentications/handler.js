const LoginUserUseCase = require('../../../../Applications/use_case/LoginUserUseCase');
const RefreshAuthenticationUseCase = require('../../../../Applications/use_case/RefreshAuthenticationUseCase');
const LogoutUserUseCase = require('../../../../Applications/use_case/LogoutUserUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      const loginUserUseCase = this._container.getInstance(LoginUserUseCase.name);
      const { accessToken, refreshToken } = await loginUserUseCase.execute(req.body);
      
      res.status(201).json({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      const refreshAuthenticationUseCase = this._container
        .getInstance(RefreshAuthenticationUseCase.name);
      const accessToken = await refreshAuthenticationUseCase.execute(req.body);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      const logoutUserUseCase = this._container.getInstance(LogoutUserUseCase.name);
      await logoutUserUseCase.execute(req.body);
      
      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthenticationsHandler;