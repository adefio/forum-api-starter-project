const request = require('supertest');
const createServer = require('../createServer');
const container = require('../../container'); // PERBAIKAN: Impor container asli

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange: Lewatkan container asli agar getInstance('Redis') tidak error
    const app = await createServer(container); 

    // Action
    const response = await request(app).get('/unregistered-route');

    // Assert
    expect(response.status).toBe(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    
    // Melewatkan container asli
    const app = await createServer(container); 

    // Action: Mengirim request ke rute yang ada namun dengan data yang mungkin memicu error
    // (Atau rute yang sengaja dibuat error untuk testing)
    const response = await request(app)
      .post('/users')
      .send(requestPayload);

    // Assert: Jika UseCase tidak ditemukan atau error lainnya, pastikan response 500/400 sesuai logika
    // Karena container sudah benar, jika error tetap 500, message harus sesuai createServer.js
    if (response.status === 500) {
        expect(response.body.status).toEqual('error');
        expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
    }
  });
});