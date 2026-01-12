const express = require('express');

const routes = (handler) => {
  const router = express.Router();

  // POST /authentications (Login)
  router.post('/', handler.postAuthenticationHandler);

  // PUT /authentications (Refresh Token)
  router.put('/', handler.putAuthenticationHandler);

  // DELETE /authentications (Logout)
  router.delete('/', handler.deleteAuthenticationHandler);

  // GET /authentications (Check Status)
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Authentication service is ready',
    });
  });

  return router;
};

module.exports = routes;