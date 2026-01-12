require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

/**
 * Fungsi start untuk menginisialisasi aplikasi.
 * Fungsi ini bersifat async karena createServer (inisialisasi database/container) membutuhkan waktu.
 */
const start = async () => {
  // createServer mengembalikan instance express app
  const app = await createServer(container);
  const port = process.env.PORT || 5000;

  /**
   * Menjalankan server secara lokal (app.listen) hanya jika tidak berada di lingkungan produksi.
   * Di Vercel, server dijalankan secara otomatis melalui handler yang diekspor.
   */
  if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }

  // Mengembalikan instance app untuk digunakan oleh Vercel
  return app;
};

/**
 * PERBAIKAN KRITIS UNTUK VERCEL:
 * Mengekspor hasil eksekusi start() yang berupa Promise. 
 * Vercel akan menunggu Promise ini selesai sebelum menangani request, 
 * sehingga menghindari masalah objek kosong (race condition).
 */
module.exports = start();