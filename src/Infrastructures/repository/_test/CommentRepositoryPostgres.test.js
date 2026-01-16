const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getCommentsByThreadId function', () => {
    it('should return thread comments correctly including like_count', async () => {
      // Arrange
      const userPayload = { id: 'user-123', username: 'dicoding' };
      const threadPayload = { id: 'thread-123', owner: 'user-123' };
      const commentPayload = {
        id: 'comment-123',
        content: 'sebuah comment',
        threadId: threadPayload.id,
        owner: userPayload.id,
        date: '2021-08-08T07:22:33.555Z',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      // Tambahkan satu like
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', userId: userPayload.id, commentId: commentPayload.id });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toBeInstanceOf(Array);
      expect(comments[0].like_count).toEqual(1); // Pastikan key sesuai dengan query SQL Anda (biasanya integer)
    });
  });

  describe('checkIsCommentLiked function', () => {
    it('should return true if comment is liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ userId: 'user-123', commentId: 'comment-123' });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isLiked = await commentRepositoryPostgres.checkIsCommentLiked('user-123', 'comment-123');

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false if comment is not liked', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const isLiked = await commentRepositoryPostgres.checkIsCommentLiked('user-123', 'comment-123');
      expect(isLiked).toBe(false);
    });
  });

  describe('addLikeComment function', () => {
    it('should persist like to database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addLikeComment('user-123', 'comment-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists('user-123', 'comment-123');
      expect(likes).toHaveLength(1);
    });
  });
});