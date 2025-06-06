// src/model/data/index.js

// Back-end data configuration for the Fragments API. 
// This module exports the appropriate memory strategy based on environment variables.
// It supports both AWS backend data stores (TODO) (production) and in-memory database, but not both at the same time.

module.exports = require('./memory');

// TODO: Implement AWS data stores
/*  
// Prefer Amazon backend data stores (production)
if (process.env.AWS_DATA_STORE_ID) {
  module.exports = 
}
// Also allow for in-memory database to be used (development)
else if (process.NODE_ENV !== 'production') {
  module.exports = require('./memory');
} 
// In all other cases, stop and fix our config
else {
  throw new Error('missing env vars: no back-end data configuration found');
}
*/