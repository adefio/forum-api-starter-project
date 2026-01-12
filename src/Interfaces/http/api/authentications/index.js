const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const authenticationsHandler = new AuthenticationsHandler(container);
  return routes(authenticationsHandler);
};