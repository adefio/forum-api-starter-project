class StartConversationUseCase {
  constructor({ conversationRepository, userRepository }) {
    this._conversationRepository = conversationRepository;
    this._userRepository = userRepository;
  }

  async execute(userId, { username, content }) {
    const other = await this._userRepository.getUserByUsername(username);

    if (other.id === userId) {
      throw new Error('MESSAGE.CANNOT_MESSAGE_SELF');
    }

    const { conversationId } = await this._conversationRepository.getOrCreateDirectConversation(userId, other.id);
    const message = await this._conversationRepository.addMessage(conversationId, userId, content);

    return { conversationId, message };
  }
}

module.exports = StartConversationUseCase;
