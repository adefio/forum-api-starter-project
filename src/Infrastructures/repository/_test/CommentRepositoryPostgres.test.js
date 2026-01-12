const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper'); // Tambahkan ini
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable(); // Bersihkan tabel likes
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // ... (addComment, checkAvailabilityComment, verifyCommentOwner, deleteComment, getCommentsByThreadId tetap sama)

  /**
   * PENGUJIAN BARU: Fitur Like Komentar
   */
  describe('checkIsCommentLiked function', () => {
    it('should return true if comment is liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isLiked = await commentRepositoryPostgres.checkIsCommentLiked('user-123', 'comment-123');

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false if comment is not liked', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isLiked = await commentRepositoryPostgres.checkIsCommentLiked('user-123', 'comment-123');

      // Assert
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

  describe('deleteLikeComment function', () => {
    it('should remove like from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteLikeComment('user-123', 'comment-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.checkLikeIsExists('user-123', 'comment-123');
      expect(likes).toHaveLength(0);
    });
  });
});