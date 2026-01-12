const { Pool } = require('pg');

// Konfigurasi untuk Testing
const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

// Konfigurasi untuk Produksi (Supabase)
const productionConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false, // Wajib untuk Supabase agar tidak error sertifikat SSL
  },
};

// Logika pemilihan pool berdasarkan environment
const pool = process.env.NODE_ENV === 'test' 
  ? new Pool(testConfig) 
  : new Pool(productionConfig);

module.exports = pool;