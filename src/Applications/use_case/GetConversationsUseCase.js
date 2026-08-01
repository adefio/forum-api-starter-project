class GetConversationsUseCase {
  constructor({ conversationRepository }) {
    this._conversationRepository = conversationRepository;
  }

  async execute(userId) {
    return this._conversationRepository.getConversationsByUserId(userId);
  }
}

module.exports = GetConversationsUseCase;
