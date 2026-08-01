class MarkNotificationReadUseCase {
  constructor({ notificationRepository }) {
    this._notificationRepository = notificationRepository;
  }

  async execute(userId, notificationId) {
    if (notificationId) {
      return this._notificationRepository.markAsRead(userId, notificationId);
    }

    return this._notificationRepository.markAllAsRead(userId);
  }
}

module.exports = MarkNotificationReadUseCase;
