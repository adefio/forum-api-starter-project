const GetThreadDetailUseCase = require('./GetThreadDetailUseCase');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    // 1. Validasi keberadaan thread
    await this._threadRepository.verifyThreadAvailability(threadId);

    // 2. Ambil semua data terkait secara paralel untuk performa lebih baik
    const [thread, comments, replies] = await Promise.all([
      this._threadRepository.getThreadById(threadId),
      this._commentRepository.getCommentsByThreadId(threadId),
      this._replyRepository.getRepliesByThreadId(threadId),
    ]);

    // 3. Mapping komentar dan masukkan balasan ke dalamnya
    const mappedComments = comments.map((comment) => {
      const commentReplies = replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        }));

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        likeCount: comment.like_count || 0, // Mengubah snake_case ke camelCase
        replies: commentReplies,
      };
    });

    // 4. Kembalikan objek thread utuh dengan komentar yang sudah ter-mapping
    return {
      ...thread,
      comments: mappedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;