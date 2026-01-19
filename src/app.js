require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const start = async () => {
  const server = await createServer(container);

  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }

  return server;
};

module.exports = start();