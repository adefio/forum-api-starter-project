const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    // 1. Mock Data: Thread
    const mockThreadDetail = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    // 2. Mock Data: Komentar (Skenario normal & dihapus)
    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment normal',
        is_delete: false,
        like_count: 2, // Ada like
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar ini akan dihapus',
        is_delete: true, // Komentar dihapus
        like_count: 0,
      },
    ];

    // 3. Mock Data: Balasan (Skenario normal & dihapus)
    const mockReplies = [
      {
        id: 'reply-1',
        content: 'balasan normal untuk comment-1',
        date: '2021-08-08T07:28:33.555Z',
        username: 'johndoe',
        comment_id: 'comment-1',
        is_delete: false,
      },
      {
        id: 'reply-2',
        content: 'balasan ini akan dihapus untuk comment-1',
        date: '2021-08-08T07:30:33.555Z',
        username: 'dicoding',
        comment_id: 'comment-1',
        is_delete: true, // Balasan dihapus
      },
    ];

    /** Creating dependency and mocking */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    const expectedThread = {
      ...mockThreadDetail, // Menggunakan spread operator agar lebih ringkas
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment normal',
          likeCount: 2, // Harus sama dengan mock data (like_count: 2)
          replies: [
            {
              id: 'reply-1',
              content: 'balasan normal untuk comment-1',
              date: '2021-08-08T07:28:33.555Z',
              username: 'johndoe',
            },
            {
              id: 'reply-2',
              content: '**balasan telah dihapus**', // Konten harus berubah
              date: '2021-08-08T07:30:33.555Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**', // Konten harus berubah
          likeCount: 0,
          replies: [], // Tidak memiliki balasan
        },
      ],
    };

    expect(threadDetail).toStrictEqual(expectedThread);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });
});