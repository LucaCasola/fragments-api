// src/routes/api/delete-id.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Delete a fragment by ID for the current user
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;
  logger.info(`ownerId received: ${ownerId}`);
  logger.info(`fragmentId received: ${fragmentId}`);

  try {
    await Fragment.byId(ownerId, fragmentId);  // Check if fragment exists
    await Fragment.delete(ownerId, fragmentId); // Delete the fragment
    return res.status(200).json(createSuccessResponse("delete successful"));
  } catch (error) {
    logger.error(`Error processing DELETE request for fragment with id=${req.params.id}. ${error.message}`);
    return res.status(error.code || 500).json(createErrorResponse(error.code || 500, `Failed to delete fragment. ${error.message}`));
  }
};