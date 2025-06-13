// src/response.js

function createSuccessResponse(data) {
  return {
    status: 'ok',
    ...data,
  };
};

function createErrorResponse(code, message) {
  return {
    status: 'error',
    error: {
      code: code,
      message: message
    }
  }
};

module.exports.createErrorResponse = createErrorResponse;
module.exports.createSuccessResponse = createSuccessResponse;