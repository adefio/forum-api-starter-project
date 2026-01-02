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

/**
 * 1. Inisialisasi Redis client.
 * Diletakkan di luar createServer agar koneksi bisa digunakan kembali (reuse)
 * oleh berbagai instance serverless.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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

  // Registrasi plugin eksternal
  await server.register([{ plugin: Jwt }]);

  /**
   * 2. Implementasi Rate Limiting level aplikasi.
   * Menggunakan Hook onPreHandler agar dijalankan sebelum masuk ke handler route.
   */
  server.ext('onPreHandler', async (request, h) => {
    const { path } = request;

    // Batasi akses pada endpoint /threads dan turunannya (Comments/Replies/Likes)
    // Lewati jika di lingkungan test untuk menghindari timeout pada CI
    if (path.startsWith('/threads') && process.env.NODE_ENV !== 'test') {
      
      /**
       * MENGATASI PROXY VERCEL:
       * Mengambil IP asli client dari header 'x-forwarded-for'.
       * Vercel mengirimkan list IP, IP asli client adalah yang paling kiri.
       */
      const xForwardedFor = request.headers['x-forwarded-for'];
      const ip = xForwardedFor 
        ? xForwardedFor.split(',')[0].trim() 
        : request.info.remoteAddress;

      const key = `rate_limit:${ip}`;
      const limit = 90; // Batas 90 request
      const windowInSeconds = 60; // Per 1 menit (60 detik)

      try {
        // Gunakan Redis INCR secara atomik
        const currentUsage = await redis.incr(key);

        // Jika ini request pertama, set masa berlaku key
        if (currentUsage === 1) {
          await redis.expire(key, windowInSeconds);
        }

        // Jika melebihi batas, kembalikan respons 429
        if (currentUsage > limit) {
          const response = h.response({
            status: 'fail',
            message: 'terlalu banyak permintaan, silakan coba lagi nanti',
          });
          response.code(429);
          return response.takeover(); // Hentikan siklus request dan kirim respon
        }
      } catch (error) {
        // Fallback: jika Redis error, biarkan request tetap lewat agar aplikasi tidak mati, 
        // tapi log error tersebut ke console/monitoring.
        console.error('Redis Connection Error:', error.message);
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
      message: 'Forum API is running with Redis-Based Rate Limiting',
    }),
  });

  // Interceptor untuk Error Handling global (Domain Error Translator)
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