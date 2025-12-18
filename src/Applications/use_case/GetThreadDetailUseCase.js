class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    thread.comments = comments.map((comment) => {
      const commentReplies = replies.filter((reply) => reply.comment_id === comment.id);
      
      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        replies: commentReplies.map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        })),
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        likeCount: comment.like_count,
      };
    });

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;