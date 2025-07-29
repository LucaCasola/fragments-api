// src/routes/api/delete-id.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Delete a fragment by ID for a specific user
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  try {
    logger.info(`ownerId received: ${ownerId}`);
    logger.info(`fragmentId received: ${fragmentId}`);
    await Fragment.delete(ownerId, fragmentId);
    return res.status(200).json(createSuccessResponse("yippee"));
  } catch (error) {
    logger.error(`Error deleting fragment ${fragmentId} for userID: ${ownerId}. Error message: ${error.message}`);
    return res.status(500).json(createErrorResponse(500, error.message));
  }
};