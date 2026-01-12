const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

// Import API Routers
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');

const createServer = async (container) => {
  const app = express();

  // Penting untuk Vercel agar express-rate-limit bisa membaca IP asli client
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(cors());

  /**
   * KONFIGURASI RATE LIMITING (Point 2)
   * Menggunakan Redis (Upstash) agar limit tetap terjaga di infrastruktur serverless.
   */
  const redisClient = container.getInstance('Redis'); // Pastikan 'Redis' terdaftar di container.js
  
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 90, // Batas 90 request
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // Menggunakan @upstash/redis command format
      sendCommand: async (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    },
  });

  // Terapkan rate limit khusus pada path /threads
  app.use('/threads', limiter);

  /**
   * REGISTRASI ROUTER (Point 4 & 5)
   * Setiap folder API sekarang harus mengekspor fungsi yang mengembalikan express.Router()
   */
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));
  app.use('/comments', comments(container));
  app.use('/replies', replies(container));

  // Default Route
  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running with Express and Rate Limiting' });
  });

  /**
   * GLOBAL ERROR HANDLING (Point 2)
   * Menggantikan onPreResponse milik Hapi
   */
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // Jika bukan ClientError (error server/internal)
    console.error(error); // Log untuk debugging
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;