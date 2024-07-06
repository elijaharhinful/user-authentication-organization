import request from 'supertest';
import { app } from '../src/server'; // Assuming you export the app from src/server.ts
import { connectionSource } from '../src/database/ormconfig';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectionSource.initialize();
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    await connectionSource.destroy();
  });

  it('should log in user successfully with correct credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.firstName).toBe('John');
    expect(res.body.data.user.email).toBe('john.doe@example.com');
  });

  it('should fail to log in with incorrect credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrong_password',
      });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('Bad request');
    expect(res.body.message).toBe('Authentication failed');
  });
});
