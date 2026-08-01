const SettingsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const settingsHandler = new SettingsHandler(container);
  return routes(settingsHandler, container);
};
