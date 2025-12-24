require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const start = async () => {
  const server = await createServer(container);
  
  if (process.env.NODE_ENV !== 'production') {
    await server.start();
    console.log(`server start at ${server.info.uri}`);
  }

  return server;
};

module.exports = start();