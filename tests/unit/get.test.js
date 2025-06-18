// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET v1 fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    await request(app).get('/v1/fragments').expect(401)
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    await request(app).get('/v1/fragments').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.userFragments)).toBe(true);
  });

  test('all fragments for specific user are returned in array userFragments[]', async () => {
    await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('11111'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('22222'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials

    const res = await request(app).get('/v1/fragments?expanded=1').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.userFragments)).toBe(true);
    
    expect(res.body.userFragments[0]).toHaveProperty('id');
    expect(res.body.userFragments[0]).toHaveProperty('ownerId');
    expect(res.body.userFragments[0].type).toEqual('text/plain');
    expect(res.body.userFragments[0]).toHaveProperty('size');
    expect(res.body.userFragments[0]).toHaveProperty('created');
    expect(res.body.userFragments[0]).toHaveProperty('updated');

    expect(res.body.userFragments[1]).toHaveProperty('id');
    expect(res.body.userFragments[1]).toHaveProperty('ownerId');
    expect(res.body.userFragments[1].type).toEqual('text/plain');
    expect(res.body.userFragments[1]).toHaveProperty('size');
    expect(res.body.userFragments[1]).toHaveProperty('created');
    expect(res.body.userFragments[1]).toHaveProperty('updated');
  });

  test('returns 500 if Fragment.byUser throws', async () => {
    //  Mock Fragment.byUser to throw for this test only
    jest.spyOn(Fragment, 'byUser').mockImplementation(() => {
      throw new Error('error');
    });
    
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');

    //  Restore the original implementation after the test
    Fragment.byUser.mockRestore();
  });
});