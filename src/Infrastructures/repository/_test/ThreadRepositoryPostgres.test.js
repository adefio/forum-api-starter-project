const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadLikesTableTestHelper = require('../../../../tests/ThreadLikesTableTestHelper');
const UserBookmarksTableTestHelper = require('../../../../tests/UserBookmarksTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadLikesTableTestHelper.cleanTable();
    await UserBookmarksTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' }); // memasukan user agar relasi terpenuhi
      const newThread = new NewThread({
        title: 'dicoding',
        body: 'secret',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(newThread, 'user-123');

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = new NewThread({
        title: 'dicoding',
        body: 'secret',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, 'user-123');

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'dicoding',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread details correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toEqual('2021-08-08T07:19:09.775Z');
      expect(thread.comment_count).toEqual(0);
      expect(thread.like_count).toEqual(0);
      expect(thread.is_liked).toEqual(false);
      expect(thread.is_bookmarked).toEqual(false);
    });

    it('should return engagement data according to userId', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await ThreadLikesTableTestHelper.addLike({ userId: 'user-456', threadId: 'thread-123' });
      await UserBookmarksTableTestHelper.addBookmark({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123', 'user-456');

      // Assert
      expect(thread.like_count).toEqual(1);
      expect(thread.is_liked).toEqual(true);
      expect(thread.is_bookmarked).toEqual(true);
    });
  });

  describe('getAllThreads function', () => {
    it('should return all threads with engagement data', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Video MP4',
        body: 'cek https://example.com/video.mp4',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        title: 'Gambar',
        body: 'cek https://example.com/foto.png',
        owner: 'user-456',
        date: '2021-08-09T07:19:09.775Z',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getAllThreads();

      // Assert
      expect(threads).toHaveLength(2);
      expect(threads[0].id).toEqual('thread-456');
      expect(threads[1].id).toEqual('thread-123');
      expect(threads[0]).toHaveProperty('comment_count');
      expect(threads[0]).toHaveProperty('like_count');
      expect(threads[0]).toHaveProperty('is_liked');
      expect(threads[0]).toHaveProperty('is_bookmarked');
      expect(threads[0]).toHaveProperty('recent_comments');
    });

    it('should filter threads by q (title or body)', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Video MP4', body: 'cek https://example.com/video.mp4', owner: 'user-123', date: '2021-08-08T07:19:09.775Z' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', title: 'Gambar', body: 'cek https://example.com/foto.png', owner: 'user-456', date: '2021-08-09T07:19:09.775Z' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getAllThreads(null, { q: 'gambar' });

      // Assert
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual('thread-456');
    });

    it('should filter threads by type video/image/text', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Video MP4', body: 'cek https://example.com/video.mp4', owner: 'user-123', date: '2021-08-08T07:19:09.775Z' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', title: 'Gambar', body: 'cek https://example.com/foto.png', owner: 'user-456', date: '2021-08-09T07:19:09.775Z' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const videoThreads = await threadRepositoryPostgres.getAllThreads(null, { type: 'video' });
      const imageThreads = await threadRepositoryPostgres.getAllThreads(null, { type: 'image' });
      const textThreads = await threadRepositoryPostgres.getAllThreads(null, { type: 'text' });

      // Assert
      expect(videoThreads).toHaveLength(1);
      expect(videoThreads[0].id).toEqual('thread-123');
      expect(imageThreads).toHaveLength(1);
      expect(imageThreads[0].id).toEqual('thread-456');
      expect(textThreads).toHaveLength(0);
    });

    it('should return is_liked and is_bookmarked true when userId matches', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123', date: '2021-08-09T07:19:09.775Z' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-456', date: '2021-08-08T07:19:09.775Z' });
      await ThreadLikesTableTestHelper.addLike({ userId: 'user-123', threadId: 'thread-123' });
      await UserBookmarksTableTestHelper.addBookmark({ userId: 'user-123', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getAllThreads('user-123');

      // Assert
      expect(threads[0].is_liked).toEqual(true);
      expect(threads[0].is_bookmarked).toEqual(true);
      expect(threads[1].is_liked).toEqual(false);
      expect(threads[1].is_bookmarked).toEqual(false);
    });

    it('should return recent_comments containing max 2 latest non-deleted comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-123',
        owner: 'user-456',
        date: '2021-08-08T08:00:00.000Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-123',
        owner: 'user-456',
        date: '2021-08-08T09:00:00.000Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        threadId: 'thread-123',
        owner: 'user-456',
        date: '2021-08-08T10:00:00.000Z',
        isDelete: true,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getAllThreads();

      // Assert
      expect(threads[0].recent_comments).toHaveLength(2);
      expect(threads[0].recent_comments[0].date).toEqual('2021-08-08T09:00:00.000Z');
      expect(threads[0].recent_comments[1].date).toEqual('2021-08-08T08:00:00.000Z');
      expect(threads[0].recent_comments[0]).toHaveProperty('username');
      expect(threads[0].recent_comments[0]).toHaveProperty('content');
    });
  });

  describe('thread like functions', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    });

    it('should add thread like', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await threadRepositoryPostgres.addThreadLike('user-456', 'thread-123');

      // Assert
      const likes = await ThreadLikesTableTestHelper.checkLikeIsExists('user-456', 'thread-123');
      expect(likes).toHaveLength(1);
    });

    it('should delete thread like', async () => {
      // Arrange
      await ThreadLikesTableTestHelper.addLike({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await threadRepositoryPostgres.deleteThreadLike('user-456', 'thread-123');

      // Assert
      const likes = await ThreadLikesTableTestHelper.checkLikeIsExists('user-456', 'thread-123');
      expect(likes).toHaveLength(0);
    });

    it('should check is thread liked', async () => {
      // Arrange
      await ThreadLikesTableTestHelper.addLike({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkIsThreadLiked('user-456', 'thread-123')).resolves.toEqual(true);
      await expect(threadRepositoryPostgres.checkIsThreadLiked('user-123', 'thread-123')).resolves.toEqual(false);
    });

    it('should get thread like count', async () => {
      // Arrange
      await ThreadLikesTableTestHelper.addLike({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const likeCount = await threadRepositoryPostgres.getThreadLikeCount('thread-123');

      // Assert
      expect(likeCount).toEqual(1);
    });
  });

  describe('bookmark functions', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    });

    it('should add bookmark with generated id', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addBookmark('user-456', 'thread-123');

      // Assert
      const bookmarks = await UserBookmarksTableTestHelper.checkBookmarkIsExists('user-456', 'thread-123');
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].id).toEqual('bookmark-123');
    });

    it('should delete bookmark', async () => {
      // Arrange
      await UserBookmarksTableTestHelper.addBookmark({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await threadRepositoryPostgres.deleteBookmark('user-456', 'thread-123');

      // Assert
      const bookmarks = await UserBookmarksTableTestHelper.checkBookmarkIsExists('user-456', 'thread-123');
      expect(bookmarks).toHaveLength(0);
    });

    it('should check is thread bookmarked', async () => {
      // Arrange
      await UserBookmarksTableTestHelper.addBookmark({ userId: 'user-456', threadId: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkIsThreadBookmarked('user-456', 'thread-123')).resolves.toEqual(true);
      await expect(threadRepositoryPostgres.checkIsThreadBookmarked('user-123', 'thread-123')).resolves.toEqual(false);
    });
  });

  describe('verifyThreadOwner function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadOwner('thread-123', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is different', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadOwner('thread-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadOwner('thread-123', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getOwnerByThreadId function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getOwnerByThreadId('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return owner id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const owner = await threadRepositoryPostgres.getOwnerByThreadId('thread-123');

      // Assert
      expect(owner).toEqual('user-123');
    });
  });

  describe('editThread function', () => {
    it('should update thread title and body correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'old title',
        body: 'old body',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.editThread('thread-123', {
        title: 'new title',
        body: 'new body',
      });

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('new title');
      expect(thread.body).toEqual('new body');
      expect(thread.date).toBeDefined();
    });
  });
});