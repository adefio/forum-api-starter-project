const NotificationsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const notificationsHandler = new NotificationsHandler(container);
  return routes(notificationsHandler, container);
};
