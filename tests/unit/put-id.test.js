// tests/unit/put-id.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('PUT v1 fragment by id', () => {
  test('unauthenticated requests are denied', async () => {
    await request(app).put('/v1/fragments/123').expect(401)
  });

  test('incorrect credentials requests are denied', async () => {
    await request(app).put('/v1/fragments/123').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  test('no content header requests requests are rejected', async () => {
    const res = await request(app).put('/v1/fragments/123').auth('user1@email.com', 'password1')
    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('content-type header is missing from object');
  });

  test('unsupported content headers are rejected', async () => {
    const res = await request(app).put('/v1/fragments/123')
      .set('Content-Type', 'invalid/type')   // Send an invalid Content-Type header
      .send( '123' )  // Send a string as the request body
      .auth('user1@email.com', 'password1')  // Send valid credentials

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Failed to update fragment data. Unsupported Content-Type: invalid/type');
  });

  test('empty request body is rejected', async () => {
    const res = await request(app).put('/v1/fragments/123')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .auth('user1@email.com', 'password1')  // Send valid credentials

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Failed to update fragment data. Request body must be a Buffer and must not be empty');
  });

  test('returns 404 if trying to edit fragment that does not exist', async () => {
    const res = await request(app).put(`/v1/fragments/999999999`)
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('edited test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Failed to update fragment data. Fragment with id=999999999 does not exist');
  });

  test('returns 400 if trying to edit a fragment but sent the wrong content-type', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');


    const res2 = await request(app).put(`/v1/fragments/${res.body.fragment.id}`)
      .set('Content-Type', 'text/markdown')  // Set an valid Content-Type header, but of the wrong type
      .send(Buffer.from('edited test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    
    expect(res2.statusCode).toBe(400);
    expect(res2.body.status).toBe('error');
    expect(res2.body.error.message).toBe('Failed to update fragment data. Fragment type mismatch: expected text/plain, received text/markdown');
  });

  test('authenticated users can edit a plain text fragment and response includes all expected properties', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');


    const res2 = await request(app).put(`/v1/fragments/${res.body.fragment.id}`)
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('edited test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    
    expect(res2.statusCode).toBe(200);
    expect(res2.body.status).toBe('ok');
    expect(res2.body.fragment.id).toBe(res.body.fragment.id);
    expect(res2.body.fragment.ownerId).toBe(res.body.fragment.ownerId);
    expect(res2.body.fragment.type).toBe(res.body.fragment.type);
    expect(res2.body.fragment.size).toBeGreaterThan(res.body.fragment.size);
    expect(res2.body.fragment.created).toBe(res.body.fragment.created);
    expect(res2.body.fragment.updated).not.toBe(res.body.fragment.updated);
  });
});