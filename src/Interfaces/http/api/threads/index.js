const ThreadsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const threadsHandler = new ThreadsHandler(container);
  return routes(threadsHandler, container);
};