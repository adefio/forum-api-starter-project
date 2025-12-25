const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');

const createServer = async (container) => {
  /**
   * PENTING: requestHistory harus di dalam createServer 
   * agar reset (kosong kembali) setiap kali fungsi ini dipanggil oleh test.
   */
  const requestHistory = new Map();

  const server = Hapi.server({
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Registrasi plugin eksternal
  await server.register([{ plugin: Jwt }]);

  // Logika Manual Rate Limiting
  server.ext('onPreHandler', (request, h) => {
    const { path } = request;

    // Batasi hanya untuk endpoint threads (termasuk comment & reply)
    if (path.startsWith('/threads')) {
      const ip = request.info.remoteAddress;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 menit
      const limit = 90; 

      if (!requestHistory.has(ip)) {
        requestHistory.set(ip, []);
      }

      let timestamps = requestHistory.get(ip);
      // Buang timestamp yang sudah lewat dari 1 menit
      timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

      if (timestamps.length >= limit) {
        const response = h.response({
          status: 'fail',
          message: 'Max rate limit exceeded',
        });
        response.code(429);
        return response.takeover(); // Hentikan siklus request di sini
      }

      timestamps.push(now);
      requestHistory.set(ip, timestamps);
    }

    return h.continue;
  });

  // Strategi Autentikasi JWT
  server.auth.strategy('forumapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCCESS_TOKEN_AGE, // Pastikan sinkron dengan .env
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Registrasi Plugin API
  await server.register([
    { plugin: users, options: { container } },
    { plugin: authentications, options: { container } },
    { plugin: threads, options: { container } },
    { plugin: comments, options: { container } },
    { plugin: replies, options: { container } },
  ]);

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      message: 'Forum API is running with Rate Limiting',
    }),
  });

  // Error Handling (onPreResponse)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response);

      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;