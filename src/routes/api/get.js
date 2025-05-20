// src/routes/api/get.js

// Used to create a success response object in HTTP responses
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const fragments = [];
  res.status(200).json(createSuccessResponse({ fragments }));
};