class GetUnreadNotificationsCountUseCase {
  constructor({ notificationRepository }) {
    this._notificationRepository = notificationRepository;
  }

  async execute(userId) {
    return this._notificationRepository.getUnreadCount(userId);
  }
}

module.exports = GetUnreadNotificationsCountUseCase;
