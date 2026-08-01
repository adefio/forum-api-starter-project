class NotificationRepository {
  async addNotification({ userId, actorId, type, threadId = null, commentId = null }) {
    throw new Error('NOTIFICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getNotifications(userId, type) {
    throw new Error('NOTIFICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getUnreadCount(userId) {
    throw new Error('NOTIFICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async markAsRead(userId, notificationId) {
    throw new Error('NOTIFICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async markAllAsRead(userId) {
    throw new Error('NOTIFICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = NotificationRepository;
