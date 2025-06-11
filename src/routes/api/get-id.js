// src/routes/api/get-id.js

const { createSuccessResponse, createErrorResponse } = require('../../response');  // Used to create a success response object in HTTP responses
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  try {
    logger.info(`Fetching fragment: ${fragmentId}, for user: ${ownerId}`);

    const fragment = await Fragment.byId(ownerId, fragmentId);
    const data = await fragment.getData();

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).json(createSuccessResponse(data));
  } catch (err) {
    logger.error(`Error fetching fragment ${fragmentId}: ${err.message}`);
    res.status(404).json(createErrorResponse(404, `Fragment not found for fragmentId: ${fragmentId}`));
  }
};