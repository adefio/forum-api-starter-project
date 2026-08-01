class ToggleBookmarkUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, credentialId }) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    const isBookmarked = await this._threadRepository.checkIsThreadBookmarked(credentialId, threadId);

    if (isBookmarked) {
      await this._threadRepository.deleteBookmark(credentialId, threadId);
    } else {
      await this._threadRepository.addBookmark(credentialId, threadId);
    }

    return { isBookmarked: !isBookmarked };
  }
}

module.exports = ToggleBookmarkUseCase;
