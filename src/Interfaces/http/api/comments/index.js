const express = require('express');
const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const repliesHandler = new RepliesHandler(container);
  /**
   * PERBAIKAN: Menggunakan Express Router dengan mergeParams: true.
   * Ini memungkinkan handler membaca parameter :threadId dan :commentId dari URL induk.
   */
  const router = express.Router({ mergeParams: true });
  
  return routes(router, repliesHandler);
};