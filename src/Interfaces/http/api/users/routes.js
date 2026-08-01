const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  router.post('/', (req, res, next) => handler.postUserHandler(req, res, next));

  router.get('/', optionalAuthMiddleware(container), (req, res, next) =>
    handler.getUsersHandler(req, res, next),
  );

  router.get('/:username/followers', optionalAuthMiddleware(container), (req, res, next) =>
    handler.getFollowersHandler(req, res, next),
  );

  router.get('/:username/following', optionalAuthMiddleware(container), (req, res, next) =>
    handler.getFollowingHandler(req, res, next),
  );

  router.get('/:username', optionalAuthMiddleware(container), (req, res, next) =>
    handler.getUserProfileHandler(req, res, next),
  );

  router.post('/:username/follow', authMiddleware(container), (req, res, next) =>
    handler.postFollowHandler(req, res, next),
  );

  router.delete('/:username/follow', authMiddleware(container), (req, res, next) =>
    handler.deleteFollowHandler(req, res, next),
  );

  return router;
};

module.exports = routes;
