class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, credentialId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);

    const isLiked = await this._commentRepository.checkIsCommentLiked(credentialId, commentId);

    if (isLiked) {
      await this._commentRepository.deleteLikeComment(credentialId, commentId);
    } else {
      await this._commentRepository.addLikeComment(credentialId, commentId);
    }
  }
}

module.exports = LikeCommentUseCase;