const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  // POST /threads (Rute yang perlu login)
  router.post('/', authMiddleware(container), handler.postThreadHandler);

  // GET /threads (Rute umum - List Threads)
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      data: {
        threads: [],
      },
    });
  });

  // GET /threads/:threadId (Rute umum - Detail Thread)
  router.get('/:threadId', handler.getThreadHandler);

  return router;
};

module.exports = routes;