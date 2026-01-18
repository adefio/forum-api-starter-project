const express = require('express');
const routes = require('./routes');
const CommentsHandler = require('./handler');

const comments = (container) => {
  const commentsHandler = new CommentsHandler(container);
  /**
   * Menambahkan mergeParams: true agar parameter dari parent router 
   * (seperti :threadId) dapat diakses di dalam handler komentar.
   */
  const router = express.Router({ mergeParams: true });
  
  return routes(router, commentsHandler);
};

module.exports = comments;