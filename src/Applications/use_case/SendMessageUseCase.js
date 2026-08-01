class SendMessageUseCase {
  constructor({ conversationRepository }) {
    this._conversationRepository = conversationRepository;
  }

  async execute(userId, conversationId, { content }) {
    await this._conversationRepository.verifyConversationParticipant(conversationId, userId);
    return this._conversationRepository.addMessage(conversationId, userId, content);
  }
}

module.exports = SendMessageUseCase;
