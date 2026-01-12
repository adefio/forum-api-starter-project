const request = require('supertest');
const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const app = await createServer({}); // Passing empty container

    // Action
    const response = await request(app).get('/unregisteredRoute');

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
    
    /** * Melewatkan container kosong akan memicu error 500 
     * karena router tidak dapat menemukan instance UseCase yang dibutuhkan.
     */
    const app = await createServer({}); 

    // Action
    const response = await request(app)
      .post('/users')
      .send(requestPayload);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });
});