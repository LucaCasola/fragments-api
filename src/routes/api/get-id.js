// src/routes/api/get-id.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Get a specific fragment by ID for the current user
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  try {
    logger.info(`Fetching fragment: ${fragmentId}, for user: ${ownerId}`);
    const fragment = await Fragment.byId(ownerId, fragmentId);

    if (fragment.type == 'text/plain') {
      const fragmentData = await fragment.getData();
      logger.info(`Fragment ${fragmentId} is of type text/plain, converting data to string`);
      return res.status(200).json(createSuccessResponse({ fragmentData: fragmentData.toString() }));
    } else {
      logger.warn(`Fragment ${fragmentId} is of unknown type. Type is: ${fragment.type}`);
      return res.status(415).json(createErrorResponse(415, `Unsupported fragment type: ${fragment.type} for fragmentId: ${fragmentId}`));
    }
  } catch (err) {
    logger.error(`Error fetching fragment ${fragmentId}: ${err.message}`);
    return res.status(404).json(createErrorResponse(404, `Fragment not found for fragmentId: ${fragmentId}`));
  }
};