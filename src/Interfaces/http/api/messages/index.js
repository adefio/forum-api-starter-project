const MessagesHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const messagesHandler = new MessagesHandler(container);
  return routes(messagesHandler, container);
};
