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
  const server = Hapi.server({
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // 1. Registrasi Plugin Eksternal (JWT)
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // 2. Implementasi Rate Limiting Manual (Khusus untuk Vercel)
  // Menyimpan riwayat request di dalam memory (Map)
  const requestHistory = new Map();

  server.ext('onPreHandler', (request, h) => {
    const { path } = request;

    // Kriteria: Batasi resource /threads dan path di dalamnya
    if (path.startsWith('/threads')) {
      const ip = request.info.remoteAddress;
      const now = Date.now();
      const windowMs = 60 * 1000; // Jendela waktu 1 menit
      const limit = 90; // Batas 90 request

      if (!requestHistory.has(ip)) {
        requestHistory.set(ip, []);
      }

      // Bersihkan timestamp yang sudah lama (> 1 menit)
      const timestamps = requestHistory.get(ip).filter((timestamp) => now - timestamp < windowMs);
      timestamps.push(now);
      requestHistory.set(ip, timestamps);

      // Jika jumlah request melebihi batas, kembalikan error 429
      if (timestamps.length > limit) {
        const response = h.response({
          status: 'fail',
          message: 'Max rate limit exceeded',
        });
        response.code(429);
        return response.takeover();
      }
    }

    return h.continue;
  });

  // 3. Definisi Strategy Autentikasi JWT
  server.auth.strategy('forumapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // 4. Registrasi Plugin Internal
  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
    {
      plugin: replies,
      options: { container },
    },
  ]);

  // Rute root
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      message: 'Forum API is running with Rate Limiting',
    }),
  });

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