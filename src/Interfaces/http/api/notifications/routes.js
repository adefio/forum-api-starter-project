const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  router.get('/unread-count', authMiddleware(container), (req, res, next) =>
    handler.getUnreadCountHandler(req, res, next),
  );

  router.put('/read', authMiddleware(container), (req, res, next) =>
    handler.putNotificationReadHandler(req, res, next),
  );

  router.get('/', authMiddleware(container), (req, res, next) =>
    handler.getNotificationsHandler(req, res, next),
  );

  return router;
};

module.exports = routes;
