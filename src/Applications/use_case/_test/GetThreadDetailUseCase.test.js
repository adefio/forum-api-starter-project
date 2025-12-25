const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThreadDetail = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
        like_count: 2,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        content: 'sebuah balasan',
        date: '2021-08-08T07:28:33.555Z',
        username: 'johndoe',
        comment_id: 'comment-1',
        is_delete: false,
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
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              content: 'sebuah balasan',
              date: '2021-08-08T07:28:33.555Z',
              username: 'johndoe',
            },
          ],
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