const AnalyticsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const analyticsHandler = new AnalyticsHandler(container);
  return routes(analyticsHandler, container);
};
