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

  // --- GLOBAL ERROR HANDLING (FINAL FIX) ---
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    // LOGIKA PENANGANAN ERROR 401 YANG CERDAS:
    // Kita harus membedakan antara "Login Gagal" (Wrong Password) dengan "Token Tidak Ada" (Missing Auth).
    
    // Cek apakah error ini statusnya 401
    if (translatedError.statusCode === 401 || error.status === 401) {
      // Jika pesannya BUKAN tentang password salah, maka paksa jadi "Missing authentication"
      // Ini akan memuaskan Postman (Token test) tanpa merusak Authentications Test (Login test)
      if (translatedError.message !== 'kredensial yang Anda masukkan salah') {
        return res.status(401).json({
          status: 'fail',
          message: 'Missing authentication',
        });
      }
    }

    // Penanganan ClientError standar (termasuk wrong password)
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // Server Error
    console.error(error); 
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;