const express = require('express');
const routes = require('./routes');
const CommentsHandler = require('./handler');

/**
 * Fungsi factory untuk menginisialisasi router komentar.
 * * @param {object} container - Dependency Injection Container.
 * @returns {express.Router} - Router Express yang sudah terkonfigurasi.
 */
const comments = (container) => {
  const commentsHandler = new CommentsHandler(container);
  
  /**
   * PERBAIKAN: Mengaktifkan mergeParams: true.
   * Tanpa ini, req.params.threadId akan bernilai undefined karena parameter 
   * tersebut didefinisikan di level router induk (createServer.js).
   */
  const router = express.Router({ mergeParams: true });
  
  return routes(router, commentsHandler);
};

module.exports = comments;