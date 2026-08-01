const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');

const routes = (handler, container) => {
  const router = express.Router();

  router.get('/', authMiddleware(container), (req, res, next) =>
    handler.getSettingsHandler(req, res, next),
  );

  router.put('/', authMiddleware(container), (req, res, next) =>
    handler.putSettingsHandler(req, res, next),
  );

  return router;
};

module.exports = routes;
