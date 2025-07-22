// tests/unit/get-id.test.js

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
    const text = 'This is a test fragment data';

    // First, create a fragment to retrieve
    const res1 = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/plain')  // Set a valid Content-Type header
      .send(Buffer.from(text))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    expect(res1.statusCode).toBe(201);
    
    // Now, retrieve the fragment data by its ID
    const res2 = await request(app).get(`/v1/fragments/${res1.body.fragment.id}`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.headers['content-type']).toBe('text/plain');
    expect(res2.headers['content-length']).toBe(text.length.toString());
    expect(res2.text).toEqual(text);  // The data should match what was sent
  });

  // Using a valid username/password and valid fragment ID ending with .html
  // should return the fragment's markdown data converted to html
  test(`authenticated user get a fragment's data with supported extension`, async () => {
    const markdown = `## Lorem Header\n\nadipisicing elit, sed do eiusmod`;
    const html = `<h2>Lorem Header</h2>\n<p>adipisicing elit, sed do eiusmod</p>`;

    // First, create a fragment to retrieve
    const res1 = await request(app).post('/v1/fragments')
      .set('Content-Type', 'text/markdown')  // Set a valid Content-Type header
      .send(Buffer.from(markdown))  // Send a valid Buffer as the request body
      .auth('user1@email.com', 'password1');  // Send valid credentials
    expect(res1.statusCode).toBe(201);

    // Now, retrieve the fragment data converted from md to HTML by its ID
    const res2 = await request(app).get(`/v1/fragments/${res1.body.fragment.id}.html`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.headers['content-type']).toBe('text/html');
    expect(res2.headers['content-length']).toBe((html.length + 1).toString());  // +1 for the newline character
    expect(res2.text.trim()).toEqual(html);  // The data should match what was sent but converted to HTML
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