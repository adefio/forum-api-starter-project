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

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  try {
    const server = await initServer();

    // Hapi Injector
    const response = await server.inject({
      method: req.method,
      url: req.url,
      payload: req.body,
      headers: req.headers,
    });

    res.statusCode = response.statusCode;
    Object.keys(response.headers).forEach((key) => {
      res.setHeader(key, response.headers[key]);
    });
    res.end(response.rawPayload);
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    }));
  }
};

// Menjalankan server secara lokal (bukan di Vercel)
if (process.env.NODE_ENV !== 'production') {
  initServer().then((server) => {
    server.start();
    console.log(`Server berjalan lokal pada ${server.info.uri}`);
  });
}