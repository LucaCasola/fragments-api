// tests/unit/get-id-info.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET v1 fragment info by ID', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    await request(app).get('/v1/fragments/123/info').expect(401)
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    await request(app).get('/v1/fragments/123/info').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  // Using a valid username/password pair should give a success result with a fragment's data
  test(`authenticated user get a fragment's info`, async () => {
    // First, create a fragment to retrieve
    const res1 = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('11111'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    expect(res1.statusCode).toBe(201);
    
    // Now, retrieve the fragment data by its ID
    const res2 = await request(app).get(`/v1/fragments/${res1.body.fragment.id}/info`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.fragment.id).toEqual(res1.body.fragment.id);
    expect(res2.body.fragment).toHaveProperty('ownerId');
    expect(res2.body.fragment).toHaveProperty('created');
    expect(res2.body.fragment).toHaveProperty('updated');
    expect(res2.body.fragment.type).toEqual('text/plain');
    expect(res2.body.fragment).toHaveProperty('size');

  });
});