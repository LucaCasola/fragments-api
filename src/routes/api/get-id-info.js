// src/routes/api/get-id-info.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

// Get metadata for a fragment by ID for the current user
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;
  logger.info(`ownerId received: ${ownerId}`);
  logger.info(`fragmentId received: ${fragmentId}`);
  
  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);
    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error processing GET metadata request for fragment with id=${req.params.id}. ${error.message}`);
    return res.status(error.code || 500).json(createErrorResponse(error.code || 500, `Failed to get fragment metadata. ${error.message}`));
  }
};