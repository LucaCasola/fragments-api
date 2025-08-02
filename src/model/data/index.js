// src/model/data/index.js

// Back-end data configuration for the Fragments API. 
// This module exports the appropriate memory strategy based on environment variables.
// It supports both AWS backend data stores (production) and in-memory database (development), but not both at the same time.


// AWS data stores (production)
if ((process.env.DB_TYPE == 'aws') && process.env.AWS_REGION) {
  module.exports = require('./aws');
}
// Also allow for memoryDB to be used (development)
else if ((process.env.DB_TYPE == 'in-memory') && process.NODE_ENV !== 'production') {
  module.exports = require('./memory');
}
// In all other cases, stop and fix our config
else {
  throw new Error('improper env vars: no proper database configuration found');
}