const express = require('express');

const routes = (handler) => {
  const router = express.Router();

  // POST /users (Rute umum - Pendaftaran User baru tidak butuh authMiddleware)
  router.post('/', (req, res, next) => handler.postUserHandler(req, res, next));

  // GET /users (Cek status layanan)
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'User service is ready',
    });
  });

  return router;
};

module.exports = routes;