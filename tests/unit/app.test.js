// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET unknown route', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unknown route access is directed to 404', async () => {
    await request(app).get('/unknownRoute').expect(404)
  });
});