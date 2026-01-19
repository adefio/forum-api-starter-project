const CommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const commentsHandler = new CommentsHandler(container);
  return routes(commentsHandler, container);
};