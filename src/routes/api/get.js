// src/routes/api/get.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Get a list of fragments for the current user
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    logger.info(`ownerId received: ${ownerId}`);
    const userFragments = await Fragment.byUser(ownerId, true);
    return res.status(200).json(createSuccessResponse({ userFragments }));
  } catch (error) {
    logger.error(`Error fetching fragments for user: ${error.message}`);
    return res.status(500).json(createErrorResponse(500, error.message));
  }
};