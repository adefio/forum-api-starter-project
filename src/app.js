require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

let memoizedServer; 

const initServer = async () => {
  if (memoizedServer) {
    return memoizedServer;
  }
  
  const server = await createServer(container);

  await server.initialize();
  
  memoizedServer = server;
  return server;
};

module.exports = async (req, res) => {
  try {
    const server = await initServer();
    server.listener(req, res);
  } catch (error) {
    console.error('SERVER INITIALIZATION ERROR:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};