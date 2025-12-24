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
        like_count: 0, 
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah comment',
        is_delete: true,
        like_count: 0, 
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
      {
        id: 'reply-2',
        content: 'sebuah balasan',
        date: '2021-08-08T07:30:33.555Z',
        username: 'dicoding',
        comment_id: 'comment-1',
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(mockReplies));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const expectedThread = {
      ...mockThreadDetail,
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          likeCount: 0, 
          replies: [
            {
              id: 'reply-1',
              content: 'sebuah balasan',
              date: '2021-08-08T07:28:33.555Z',
              username: 'johndoe',
            },
            {
              id: 'reply-2',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T07:30:33.555Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0, 
          replies: [],
        },
      ],
    };

    // Action
    const thread = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });
});