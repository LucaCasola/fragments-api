// src/model/data/index.js

// Back-end data configuration for the Fragments API. 
// This module exports the appropriate memory strategy based on environment variables.
// It supports both AWS backend data stores (TODO) (production) and in-memory database, but not both at the same time.

module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');