// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('POST v1 fragments', () => {
  test('unauthenticated requests are denied', async () => {
    await request(app).post('/v1/fragments').expect(401)
  });

  test('incorrect credentials requests are denied', async () => {
    await request(app).post('/v1/fragments').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  test('no content header requests requests are rejected', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('content-type header is missing from object');
  });

  test('contentType other than text/plain are not supported', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'application/json')   // Send an invalid Content-Type header
      .send({ num: 123 })  // Send an object as the request body
      .auth('user1@email.com', 'password1')  // Send valid credentials

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported Content-Type: application/json');
  });

  test('contentType automatically set as other than text/plain are not supported', async () => {
    const res = await request(app).post('/v1/fragments')
      .send({ num: 123 })  // Send an object (invalid) as the request body
      .auth('user1@email.com', 'password1')  // Send valid credentials

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported Content-Type: application/json');
  });

  test('empty request body is rejected', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .auth('user1@email.com', 'password1')  // Send valid credentials

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Request body must be a Buffer and must not be empty');
  });

  test('returns 500 if anything throws', async () => {
    //  Mock Fragment.byUser to throw for this test only
    jest.spyOn(Fragment.prototype, 'save').mockImplementation(() => {
      throw new Error('error');
    });
    
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');

    //  Restore the original implementation after the test
    Fragment.prototype.save.mockRestore();
  });

  test('authenticated users can create a plain text fragment and response includes all expected properties', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('test fragment data'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('ownerId');
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('size');
    expect(res.body).toHaveProperty('created');
    expect(res.body).toHaveProperty('updated');
  });

  test('authenticated users receive a Location header with a full URL to get the created fragment', async () => {
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('test fragment data'))
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers).toHaveProperty('location');
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[a-zA-Z0-9-]+/);
  });
});