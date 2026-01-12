const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  // mergeParams: true diperlukan agar parameter :threadId dari rute induk bisa terbaca
  const router = express.Router({ mergeParams: true });

  // POST /threads/:threadId/comments
  router.post('/', authMiddleware(container), handler.postCommentHandler);

  // DELETE /threads/:threadId/comments/:commentId
  router.delete('/:commentId', authMiddleware(container), handler.deleteCommentHandler);

  // PUT /threads/:threadId/comments/:commentId/likes
  router.put('/:commentId/likes', authMiddleware(container), handler.putLikeCommentHandler);

  // GET /threads/:threadId/comments (Hanya untuk cek layanan ready)
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Comment service is ready',
    });
  });

  return router;
};

module.exports = routes;