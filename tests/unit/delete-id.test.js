// tests/unit/delete-id.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE v1 fragment by id', () => {
  test('unauthenticated requests are denied', async () => {
    await request(app).delete('/v1/fragments/123').expect(401)
  });

  test('incorrect credentials requests are denied', async () => {
    await request(app).delete('/v1/fragments/123').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  test('returns 404 if trying to delete fragment that does not exist', async () => {
    const res = await request(app).delete(`/v1/fragments/999999999`)
      .auth('user1@email.com', 'password1');  // Send valid credentials

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Failed to delete fragment. Fragment with id=999999999 does not exist');
  });

  test('authenticated users can delete a plain text fragment and response includes all expected properties', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');


    const res2 = await request(app).delete(`/v1/fragments/${res.body.fragment.id}`)
      .auth('user1@email.com', 'password1');  // Send valid credentials
    
    expect(res2.statusCode).toBe(200);
    expect(res2.body.status).toBe('ok');
  });
});