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
   * Map untuk menyimpan riwayat request per IP.
   * Didefinisikan di dalam createServer agar isolasi state terjaga saat testing.
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

  /**
   * Implementasi Manual Rate Limiting (Sliding Window) di level aplikasi.
   * Menggunakan Hook onPreHandler agar dijalankan sebelum masuk ke handler route.
   */
  server.ext('onPreHandler', (request, h) => {
    const { path } = request;

    // Batasi akses pada endpoint /threads dan turunannya sesuai feedback reviewer
    if (path.startsWith('/threads')) {
      
      /**
       * PENTING UNTUK PROXY (VERCEL/RAILWAY):
       * Mengambil IP asli client dari header 'x-forwarded-for'.
       * Jika tidak ada (lokal), gunakan remoteAddress.
       */
      const xForwardedFor = request.headers['x-forwarded-for'];
      const ip = xForwardedFor ? xForwardedFor.split(',')[0] : request.info.remoteAddress;

      const now = Date.now();
      const windowMs = 60 * 1000; // Jendela waktu: 1 Menit
      const limit = 90; // Batas: 90 request per menit

      if (!requestHistory.has(ip)) {
        requestHistory.set(ip, []);
      }

      let timestamps = requestHistory.get(ip);
      
      // Bersihkan timestamp yang sudah di luar jendela 1 menit
      timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

      if (timestamps.length >= limit) {
        // Mengembalikan respon 429 dengan format JSON yang diminta
        const response = h.response({
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'terlalu banyak permintaan, silakan coba lagi nanti',
        });
        response.code(429);
        return response.takeover(); // Langsung kirim respon tanpa memproses route
      }

      // Catat waktu request saat ini
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
      maxAgeSec: process.env.ACCCESS_TOKEN_AGE, // Pastikan variabel env ini sesuai (termasuk potensi typo)
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
      message: 'Forum API is running with Application-Level Rate Limiting',
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