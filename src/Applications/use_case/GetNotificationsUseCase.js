class GetNotificationsUseCase {
  constructor({ notificationRepository }) {
    this._notificationRepository = notificationRepository;
  }

  async execute(userId, type = 'all') {
    return this._notificationRepository.getNotifications(userId, type);
  }
}

module.exports = GetNotificationsUseCase;
