// src/routes/api/get-id-info.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const ownerId = req.user;
    logger.info(`ownerId received: ${ownerId}`);
    logger.info(`fragmentId received: ${fragmentId}`);
    const fragment = await Fragment.byId(ownerId, fragmentId);
    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error fetching fragments for user: ${error.message} and id: ${req.params.id}`);
    return res.status(500).json(createErrorResponse(500, error.message));
  }
};