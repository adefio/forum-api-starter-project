const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  router.get('/posts/:threadId', authMiddleware(container), (req, res, next) =>
    handler.getPostAnalyticsHandler(req, res, next),
  );

  router.get('/profile', authMiddleware(container), (req, res, next) =>
    handler.getProfileAnalyticsHandler(req, res, next),
  );

  return router;
};

module.exports = routes;
