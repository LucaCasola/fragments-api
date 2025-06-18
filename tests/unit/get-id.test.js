// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET v1 fragment by ID', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    await request(app).get('/v1/fragments/123').expect(401)
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    await request(app).get('/v1/fragments/123').auth('invalid@email.com', 'wrongpassword123').expect(401)
  });

  // Using a valid username/password pair should give a success result with a fragment's data
  test(`authenticated user get a fragment's data`, async () => {
    // First, create a fragment to retrieve
    const res = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from('11111'))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    expect(res.statusCode).toBe(201);

    // Now, retrieve the fragment's ID
    const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const fragmentId = res1.body.userFragments[0]
    
    // Now, retrieve the fragment data by its ID
    const res2 = await request(app).get(`/v1/fragments/${fragmentId}`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.status).toBe('ok');
    expect(res2.body.fragmentData).toEqual('11111');  // The data should match what was sent
  });

  test('returns 415 if fragment type is not supported', async () => {
    jest.spyOn(Fragment, 'byId').mockResolvedValueOnce({
      type: 'application/unsupported',
    });

    const res = await request(app)
      .get(`/v1/fragments/123`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toMatch('Unsupported fragment type');

    // Restore the mock if needed
    Fragment.byId.mockRestore();
  });

  test('returns 500 if Fragment.byUser throws', async () => {
    //  Mock Fragment.byUser to throw for this test only
    jest.spyOn(Fragment, 'byUser').mockImplementation(() => {
      throw new Error('error');
    });
    
    const res = await request(app).get('/v1/fragments/780hdn').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');

    //  Restore the original implementation after the test
    Fragment.byUser.mockRestore();
  });
});