const express = require('express');
const routes = require('./routes');
const RepliesHandler = require('./handler');

/**
 * Fungsi factory untuk menginisialisasi router balasan (replies).
 * @param {object} container - Dependency Injection Container.
 * @returns {express.Router} - Router Express yang sudah terkonfigurasi.
 */
const replies = (container) => {
  const repliesHandler = new RepliesHandler(container);
  
  /**
   * PERBAIKAN: Mengaktifkan mergeParams: true.
   * Sangat penting agar router ini dapat membaca parameter :threadId dan :commentId 
   * yang didefinisikan pada router induk (createServer.js).
   */
  const router = express.Router({ mergeParams: true });
  
  return routes(router, repliesHandler);
};

module.exports = replies;