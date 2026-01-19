/* src/Infrastructures/http/createServer.js */
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

  const redisClient = container.getInstance('Redis'); 
  
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 90, 
    standardHeaders: true, 
    legacyHeaders: false,  
    store: new RedisStore({
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

  app.use('/threads', limiter);
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));
  app.use('/threads/:threadId/comments', comments(container));
  app.use('/threads/:threadId/comments/:commentId/replies', replies(container));

  app.get('/', (req, res) => {
    res.json({ message: 'Forum API is running' });
  });

  // --- GLOBAL ERROR HANDLING (FINAL VERSION) ---
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    // 1. Cek ClientError (Error Logika Bisnis)
    // Contoh: Password salah, Username tidak tersedia.
    // Error ini SUDAH memiliki pesan yang benar ("kredensial yang Anda masukkan salah"), jadi biarkan.
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // 2. Cek Error 401 dari Middleware/Framework (Error Teknis)
    // Contoh: Tidak ada header Authorization, Token expired.
    // Error ini pesannya jelek ("Missing or invalid..."). Kita GANTI jadi "Missing authentication".
    if (error.status === 401) {
       return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication',
      });
    }

    // 3. Server Error (500)
    console.error(error); 
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;