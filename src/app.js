require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const start = async () => {
  // createServer sekarang mengembalikan instance express app
  const app = await createServer(container);
  const port = process.env.PORT || 5000;

  // Menjalankan server
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  /**
   * Penting untuk Vercel: 
   * Vercel membutuhkan ekspor dari instance Express agar dapat bekerja 
   * sebagai Serverless Function.
   */
  module.exports = app; 
};

// Menjalankan proses startup
start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});