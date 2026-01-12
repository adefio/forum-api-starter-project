const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  // mergeParams: true sangat penting agar :threadId dan :commentId 
  // dari rute induk bisa terbaca oleh handler ini.
  const router = express.Router({ mergeParams: true });

  // POST /threads/:threadId/comments/:commentId/replies
  router.post('/', authMiddleware(container), handler.postReplyHandler);

  // DELETE /threads/:threadId/comments/:commentId/replies/:replyId
  router.delete('/:replyId', authMiddleware(container), handler.deleteReplyHandler);

  // GET /threads/:threadId/comments/:commentId/replies (Cek layanan ready)
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Reply service is ready',
    });
  });

  return router;
};

module.exports = routes;