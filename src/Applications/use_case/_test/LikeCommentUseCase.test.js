const LikeCommentUseCase = require('../LikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('LikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly', async () => {
    const useCasePayload = { threadId: 'thread-123', commentId: 'comment-123', credentialId: 'user-123' };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkIsCommentLiked = jest.fn(() => Promise.resolve(false));
    mockCommentRepository.addLikeComment = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository, commentRepository: mockCommentRepository,
    });

    await likeCommentUseCase.execute(useCasePayload.threadId, useCasePayload.commentId, useCasePayload.credentialId);

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.addLikeComment).toBeCalledWith(useCasePayload.credentialId, useCasePayload.commentId);
  });
});