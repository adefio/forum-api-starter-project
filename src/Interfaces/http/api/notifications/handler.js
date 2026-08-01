const GetNotificationsUseCase = require('../../../../Applications/use_case/GetNotificationsUseCase');
const GetUnreadNotificationsCountUseCase = require('../../../../Applications/use_case/GetUnreadNotificationsCountUseCase');
const MarkNotificationReadUseCase = require('../../../../Applications/use_case/MarkNotificationReadUseCase');

const ALLOWED_TYPES = ['all', 'like', 'comment', 'reply', 'follow'];

class NotificationsHandler {
  constructor(container) {
    this._container = container;

    this.getNotificationsHandler = this.getNotificationsHandler.bind(this);
    this.getUnreadCountHandler = this.getUnreadCountHandler.bind(this);
    this.putNotificationReadHandler = this.putNotificationReadHandler.bind(this);
  }

  async getNotificationsHandler(req, res, next) {
    try {
      const getNotificationsUseCase = this._container.getInstance(GetNotificationsUseCase.name);
      const { id } = req.auth;
      const type = ALLOWED_TYPES.includes(req.query.type) ? req.query.type : 'all';

      const notifications = await getNotificationsUseCase.execute(id, type);

      res.status(200).json({
        status: 'success',
        data: {
          notifications,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCountHandler(req, res, next) {
    try {
      const getUnreadNotificationsCountUseCase = this._container
        .getInstance(GetUnreadNotificationsCountUseCase.name);
      const { id } = req.auth;

      const count = await getUnreadNotificationsCountUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: {
          count,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putNotificationReadHandler(req, res, next) {
    try {
      const markNotificationReadUseCase = this._container.getInstance(MarkNotificationReadUseCase.name);
      const { id } = req.auth;
      const { notificationId } = req.body;

      await markNotificationReadUseCase.execute(id, notificationId);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationsHandler;
