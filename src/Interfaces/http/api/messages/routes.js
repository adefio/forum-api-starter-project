const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  router.get('/', authMiddleware(container), (req, res, next) =>
    handler.getConversationsHandler(req, res, next),
  );

  router.post('/', authMiddleware(container), (req, res, next) =>
    handler.postStartConversationHandler(req, res, next),
  );

  router.get('/:conversationId', authMiddleware(container), (req, res, next) =>
    handler.getMessagesHandler(req, res, next),
  );

  router.post('/:conversationId/messages', authMiddleware(container), (req, res, next) =>
    handler.postMessageHandler(req, res, next),
  );

  router.put('/:conversationId/read', authMiddleware(container), (req, res, next) =>
    handler.putMessagesReadHandler(req, res, next),
  );

  return router;
};

module.exports = routes;
