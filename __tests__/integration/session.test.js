const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../../src/app');

const factory = require('../factories');

const truncate = require('../utils/truncate');

describe('Authentication', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should authentication with valid credentials', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });


    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123456'
      })

    expect(response.status).toBe(200);

  });

  it('should not authenticate with invalid credentials', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123'
      })

    expect(response.status).toBe(401);

  });

  it('should return jwt token when authenticate', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123456'
      })

    expect(response.body).toHaveProperty('token');

  });

  it('should be able to access private routes', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });

    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(200);

  }, 30000);

  it('should not be able to access private routes when not authenticate', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });

    const response = await request(app)
      .get('/dashboard')

    expect(response.status).toBe(401);

  });

  it('should not be able to access private routes with invalid jwt token', async () => {
    const user = await factory.create('User', {
      password: '123456'
    });

    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer 123453`)

    expect(response.status).toBe(401);
  });

});


