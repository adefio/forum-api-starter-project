const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadsUseCase = require('../GetThreadsUseCase');

describe('GetThreadsUseCase', () => {
  it('should orchestrating the get all threads action correctly', async () => {
    // Arrange
    const mockThreads = [
      {
        id: 'thread-123',
        title: 'sebuah thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
        comment_count: 2,
      },
      {
        id: 'thread-456',
        title: 'thread kedua',
        date: '2021-08-08T07:19:09.775Z',
        username: 'johndoe',
        comment_count: 0,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getAllThreads = jest.fn(() => Promise.resolve(mockThreads));

    const getThreadsUseCase = new GetThreadsUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threads = await getThreadsUseCase.execute('user-123', { q: 'sebuah', type: 'text' });

    // Assert
    expect(threads).toStrictEqual(mockThreads);
    expect(mockThreadRepository.getAllThreads).toBeCalledWith('user-123', { q: 'sebuah', type: 'text' });
  });
});
