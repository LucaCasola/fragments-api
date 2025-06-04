// src/auth/index.js

// Authorization configuration for the Fragments API. 
// This module exports the appropriate authentication strategy based on environment variables.
// It supports both AWS Cognito (production) and HTTP Basic Auth (development), but not both at the same time.

if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

// Prefer Amazon Cognito (production)
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
}
// Also allow for an .htpasswd file to be used (development)
else if (process.env.HTPASSWD_FILE && process.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
}
// In all other cases, stop and fix our config
else {
  throw new Error('missing env vars: no authorization configuration found');
}