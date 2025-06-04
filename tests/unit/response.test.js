// tests/unit/response.test.js

const { createErrorResponse, createSuccessResponse } = require('../../src/response');

describe('API Responses', () => {
  // If createErrorResponse() is called with no argument,s should return a response with just the status and message "not found".
  test('Call createErrorResponse() with no args. Should return status and message', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });

  // Calling createSuccessResponse() with no argument should return a response with just the status.
  test('Call createErrorResponse(). Should return status and message.', () => {
    const successResponse = createSuccessResponse();
    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  // Calling createSuccessResponse(data) with argument should return a response with the status and data.
  test('Call createErrorResponse(data). Should return status and data.', () => {
    // Data argument included
    const data = { a: 1, b: 2 };
    const successResponse = createSuccessResponse(data);
    expect(successResponse).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });
});