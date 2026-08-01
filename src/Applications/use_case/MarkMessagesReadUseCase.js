class MarkMessagesReadUseCase {
  constructor({ conversationRepository }) {
    this._conversationRepository = conversationRepository;
  }

  async execute(userId, conversationId) {
    await this._conversationRepository.verifyConversationParticipant(conversationId, userId);
    await this._conversationRepository.markMessagesRead(conversationId, userId);
  }
}

module.exports = MarkMessagesReadUseCase;
