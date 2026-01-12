const express = require('express');
const helmet = require('helmet');
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

  // 1. Penting untuk Vercel agar express-rate-limit bisa membaca IP asli client melalui proxy
  app.set('trust proxy', 1);

  // 2. Middleware Keamanan & Parsing (Mendukung Feedback Reviewer)
  app.use(helmet()); 
  app.use(cors());   
  app.use(express.json()); 

  /**
   * 3. KONFIGURASI RATE LIMITING DENGAN FIX KOMPATIBILITAS UPSTASH
   * Menggunakan wrapper sendCommand yang lebih aman untuk klien REST Upstash.
   */
  const redisClient = container.getInstance('Redis'); 
  
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 90, // Batas 90 request per menit
    standardHeaders: true, 
    legacyHeaders: false,  
    store: new RedisStore({
      /**
       * Perbaikan Kompatibilitas:
       * Memisahkan argumen pertama (perintah) dari sisa argumennya
       * agar sesuai dengan ekspektasi metode .call() milik @upstash/redis.
       */
      sendCommand: async (...args) => {
        const [command, ...rest] = args;
        return redisClient.call(command, ...rest);
      },
    }),
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    },
  });

  // Terapkan rate limit pada path /threads (Sesuai spesifikasi Dicoding)
  app.use('/threads', limiter);

  /**
   * 4. REGISTRASI ROUTER DENGAN POLA HIERARKI (Fix mergeParams)
   * Pola ini wajib agar :threadId dan :commentId terbaca di sub-router.
   */
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  
  // Router Utama
  app.use('/threads', threads(container));
  
  // Sub-Router (Mewariskan parameter ke comments dan replies)
  app.use('/threads/:threadId/comments', comments(container));
  app.use('/threads/:threadId/comments/:commentId/replies', replies(container));

  // Default Route
  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running with Express, Helmet, and Redis Rate Limiting' });
  });

  /**
   * 5. GLOBAL ERROR HANDLING
   * Menangani translasi error domain ke response HTTP (fail/error).
   */
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // Jika terjadi error server internal (500)
    console.error(error); 
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;