const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Redis } = require('@upstash/redis');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');

// Inisialisasi Redis client hanya jika kredensial tersedia
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  : null;

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

  await server.register([{ plugin: Jwt }]);

  /**
   * Implementasi Rate Limiting menggunakan Redis.
   * Logika ini akan dilewati (skip) saat testing agar tidak terjadi timeout 5000ms.
   */
  server.ext('onPreHandler', async (request, h) => {
    const { path } = request;

    // Aktifkan rate limit hanya jika di luar lingkungan test dan redis tersedia
    if (path.startsWith('/threads') && process.env.NODE_ENV !== 'test' && redis) {
      const xForwardedFor = request.headers['x-forwarded-for'];
      const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : request.info.remoteAddress;

      const key = `rate_limit:${ip}`;
      const limit = 90;
      const windowInSeconds = 60;

      try {
        const currentUsage = await redis.incr(key);
        if (currentUsage === 1) {
          await redis.expire(key, windowInSeconds);
        }

        if (currentUsage > limit) {
          const response = h.response({
            status: 'fail',
            message: 'terlalu banyak permintaan, silakan coba lagi nanti',
          });
          response.code(429);
          return response.takeover();
        }
      } catch (error) {
        console.error('Redis Error:', error);
      }
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
      maxAgeSec: process.env.ACCCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

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
      message: 'Forum API is running with Redis-Based Rate Limiting',
    }),
  });

  // Interceptor untuk Error Handling global
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

      if (!translatedError.isServer) return h.continue;

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