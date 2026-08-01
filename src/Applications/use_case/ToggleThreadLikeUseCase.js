class ToggleThreadLikeUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, credentialId }) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    const isLiked = await this._threadRepository.checkIsThreadLiked(credentialId, threadId);

    if (isLiked) {
      await this._threadRepository.deleteThreadLike(credentialId, threadId);
    } else {
      await this._threadRepository.addThreadLike(credentialId, threadId);
    }

    const likeCount = await this._threadRepository.getThreadLikeCount(threadId);

    return { isLiked: !isLiked, likeCount };
  }
}

module.exports = ToggleThreadLikeUseCase;
