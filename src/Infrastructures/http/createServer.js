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

  // 2. Middleware Keamanan & Parsing (Feedback: Security Headers)
  app.use(helmet()); // Menambahkan header keamanan otomatis
  app.use(cors());   // Mengizinkan akses cross-origin
  app.use(express.json()); // Body parser

  /**
   * 3. KONFIGURASI RATE LIMITING (Point 2 dari Feedback)
   * Menggunakan Redis (Upstash) agar limit tetap terjaga di infrastruktur serverless Vercel.
   */
  const redisClient = container.getInstance('Redis'); 
  
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 90, // Batas 90 request per windowMs
    standardHeaders: true, // Kirim info RateLimit di header (RateLimit-Limit, dsb)
    legacyHeaders: false,  // Nonaktifkan X-RateLimit-* headers lama
    store: new RedisStore({
      // Menggunakan @upstash/redis command format via container
      sendCommand: async (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    },
  });

  // Terapkan rate limit khusus pada path /threads (sesuai spesifikasi tugas)
  app.use('/threads', limiter);

  /**
   * 4. REGISTRASI ROUTER
   * Setiap modul API menerima container untuk Dependency Injection
   */
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));
  app.use('/comments', comments(container));
  app.use('/replies', replies(container));

  // Default Route
  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running with Express, Helmet, and Rate Limiting' });
  });

  /**
   * 5. GLOBAL ERROR HANDLING
   * Menggantikan interceptor onPreResponse milik Hapi
   */
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // Jika terjadi error server (500)
    console.error(error); // Tetap log error untuk debugging di dashboard Vercel
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;