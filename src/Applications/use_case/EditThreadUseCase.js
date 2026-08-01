class EditThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId, payload, owner) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new Error('EDIT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('EDIT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadRepository.verifyThreadOwner(threadId, owner);

    return this._threadRepository.editThread(threadId, { title, body });
  }
}

module.exports = EditThreadUseCase;
