// src/app.js
require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

let memoizedServer;

/**
 * Fungsi untuk menginisialisasi server Hapi.
 * Memoization digunakan agar server tidak dibuat ulang pada setiap request di Vercel.
 */
const initServer = async () => {
  if (memoizedServer) {
    return memoizedServer;
  }

  const server = await createServer(container);
  await server.initialize();

  memoizedServer = server;
  return server;
};

/**
 * Handler utama untuk Vercel Serverless Function.
 * Menghubungkan request HTTP standar ke sistem internal Hapi menggunakan server.inject.
 */
module.exports = async (req, res) => {
  try {
    const server = await initServer();

    const response = await server.inject({
      method: req.method,
      url: req.url,
      payload: req.body, // Vercel secara otomatis mem-parsing body jika JSON
      headers: req.headers,
    });

    // Meneruskan status code dan header dari Hapi ke respon Vercel
    res.statusCode = response.statusCode;
    Object.keys(response.headers).forEach((key) => {
      res.setHeader(key, response.headers[key]);
    });

    // Mengirimkan payload hasil proses Hapi
    res.end(response.rawPayload);
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    }));
  }
};

/**
 * Menjalankan server secara lokal jika tidak berada di lingkungan produksi (Vercel).
 */
if (process.env.NODE_ENV !== 'production') {
  initServer().then((server) => {
    server.start();
    console.log(`Server berjalan lokal pada ${server.info.uri}`);
  });
}