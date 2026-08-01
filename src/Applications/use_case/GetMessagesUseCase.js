class GetMessagesUseCase {
  constructor({ conversationRepository }) {
    this._conversationRepository = conversationRepository;
  }

  async execute(userId, conversationId) {
    await this._conversationRepository.verifyConversationParticipant(conversationId, userId);
    return this._conversationRepository.getMessagesByConversationId(conversationId);
  }
}

module.exports = GetMessagesUseCase;
