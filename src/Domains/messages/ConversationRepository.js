class ConversationRepository {
  async getConversationsByUserId(userId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getOrCreateDirectConversation(userId, otherUserId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addMessage(conversationId, senderId, content) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getMessagesByConversationId(conversationId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyConversationParticipant(conversationId, userId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async markMessagesRead(conversationId, userId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getConversationByUsers(userId, otherUserId) {
    throw new Error('CONVERSATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ConversationRepository;
