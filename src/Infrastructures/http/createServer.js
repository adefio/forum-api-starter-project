/* src/Infrastructures/http/createServer.js */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit, MemoryStore } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

// Routers
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');
const uploads = require('../../Interfaces/http/api/uploads');
const analytics = require('../../Interfaces/http/api/analytics');
const settings = require('../../Interfaces/http/api/settings');
const notifications = require('../../Interfaces/http/api/notifications');

const createServer = async (container) => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet()); 
  app.use(cors());   
  app.use(express.json()); 

  // Gunakan RedisStore hanya di production dengan Upstash; selain itu pakai
  // MemoryStore bawaan express-rate-limit agar rate-limit benar-benar bekerja
  // di local/test (mock Redis lama selalu mengembalikan [1, 100] sehingga hitungan tidak pernah bertambah).
  const useRedis = process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL;

  const buildStore = () => {
    if (useRedis) {
      return new RedisStore({
        sendCommand: async (...args) => {
          const redisClient = container.getInstance('Redis');
          return redisClient.sendCommand(...args);
        },
      });
    }
    return new MemoryStore();
  };

  const rateLimitHandler = (message) => (req, res) => {
    res.status(429).json({
      status: 'fail',
      message,
    });
  };

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 90,
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore(),
    handler: rateLimitHandler('terlalu banyak permintaan, silakan coba lagi nanti'),
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore(),
    skip: (req) => req.method !== 'POST',
    handler: rateLimitHandler('terlalu banyak percobaan login, silakan coba lagi nanti'),
  });

  // Routes
  app.use('/uploads', express.static(path.resolve(__dirname, '../../../uploads')));
  app.use('/threads', limiter);
  app.use('/users', users(container));
  app.use('/authentications', loginLimiter);
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));
  app.use('/threads/:threadId/comments', comments(container));
  app.use('/threads/:threadId/comments/:commentId/replies', replies(container));
  app.use('/uploads', uploads(container));
  app.use('/analytics', analytics(container));
  app.use('/settings', settings(container));
  app.use('/notifications', notifications(container));

  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running' });
  });

  // Global Error Handler
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ status: 'fail', message: 'ukuran file maksimal 25MB' });
    }
    if (error.message === 'UPLOADS.UNSUPPORTED_MEDIA_TYPE') {
      return res.status(415).json({ status: 'fail', message: 'format file tidak didukung' });
    }
    if (error.status === 401) {
       return res.status(401).json({ status: 'fail', message: 'Missing authentication' });
    }
    console.error(error); 
    return res.status(500).json({ status: 'error', message: 'terjadi kegagalan pada server kami' });
  });

  return app;
};

module.exports = createServer;