require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const initServer = async () => {
  const server = await createServer(container);

  if (process.env.NODE_ENV !== 'production') {
    await server.start();
    console.log(`Server berjalan lokal pada ${server.info.uri}`);
  } else {
    await server.initialize();
  }

  return server;
};

module.exports = async (req, res) => {
  const server = await initServer();
  server.listener(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  initServer();
}