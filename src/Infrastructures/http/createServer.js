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

  app.set('trust proxy', 1);
  app.use(helmet()); 
  app.use(cors());   
  app.use(express.json()); 

  // --- CONFIG RATE LIMITER (FIX INTERFACE REDIS) ---
  const rateLimitOptions = {
    windowMs: 1 * 60 * 1000, 
    max: 90, 
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    },
  };

  // Hanya aktifkan Redis jika bukan environment test
  if (process.env.NODE_ENV !== 'test') {
    const redisClient = container.getInstance('Redis');
    
    rateLimitOptions.store = new RedisStore({
      sendCommand: async (...args) => {
        const [command, ...rest] = args;

        // 1. Cek apakah client mendukung .sendCommand (Mock / Node-Redis)
        if (typeof redisClient.sendCommand === 'function') {
          return redisClient.sendCommand([command, ...rest]);
        }

        // 2. Cek apakah client mendukung .call (Upstash / ioredis)
        if (typeof redisClient.call === 'function') {
          // Upstash Redis REST client mengharapkan array sebagai argumen pertama
          if (process.env.UPSTASH_REDIS_REST_URL) {
            return redisClient.call([command, ...rest]);
          }
          // Fallback untuk ioredis atau Mock yang menggunakan parameter terpisah
          return redisClient.call(command, ...rest);
        }

        // 3. Jika tidak keduanya, coba panggil method secara dinamis (Upstash direct method)
        const method = command.toLowerCase();
        if (typeof redisClient[method] === 'function') {
          return redisClient[method](...rest);
        }

        throw new Error(`Redis client tidak mendukung command: ${command}`);
      },
    });
  }

  const limiter = rateLimit(rateLimitOptions);

  app.use('/threads', limiter);
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));
  app.use('/threads/:threadId/comments', comments(container));
  app.use('/threads/:threadId/comments/:commentId/replies', replies(container));

  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running' });
  });

  // --- GLOBAL ERROR HANDLING ---
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    if (error.status === 401) {
       return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication',
      });
    }

    console.error(error); 
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;