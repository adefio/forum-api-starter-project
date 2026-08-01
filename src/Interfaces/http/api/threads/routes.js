const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  // POST /threads (Rute yang perlu login)
  router.post('/', authMiddleware(container), handler.postThreadHandler);

  // GET /threads (Rute umum - List Threads)
  router.get('/', optionalAuthMiddleware(container), handler.getThreadsHandler);

  // GET /threads/:threadId (Rute umum - Detail Thread)
  router.get('/:threadId', optionalAuthMiddleware(container), handler.getThreadHandler);

  // PUT /threads/:threadId/likes (Rute yang perlu login)
  router.put('/:threadId/likes', authMiddleware(container), handler.putThreadLikeHandler);

  // PUT /threads/:threadId/bookmarks (Rute yang perlu login)
  router.put('/:threadId/bookmarks', authMiddleware(container), handler.putBookmarkHandler);

  // PUT /threads/:threadId (Edit Thread, Rute yang perlu login)
  router.put('/:threadId', authMiddleware(container), handler.putThreadHandler);

  return router;
};

module.exports = routes;
