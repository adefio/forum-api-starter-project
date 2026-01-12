const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const repliesHandler = new RepliesHandler(container);
  return routes(repliesHandler);
};