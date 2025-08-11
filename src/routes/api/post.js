// src/routes/api/post.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response'); 

// Add a fragment for the current user
module.exports = async (req, res) => {
    const ownerId = req.user;
    const body = req.body;  
    const type = req.headers['content-type'];

    logger.info(`ownerId received: ${ownerId}`)
    logger.info(`body received: ${body}`)
    logger.info(`type received: ${type}`)
  try {
    // Throw if Content-Type is unsupported
    if (!Fragment.isSupportedType(type))
      throw Object.assign(new Error(`Unsupported Content-Type: ${type}`), { code: 415 });
    // Throw if body is empty or !Buffer
    if (body === undefined || body === null || body.length === 0 || !Buffer.isBuffer(body))
      throw Object.assign(new Error('Request body must be a Buffer and must not be empty'), { code: 400 });

    // Create a new fragment and save it
    const fragment = new Fragment({ ownerId: ownerId, type: type });
    await fragment.save();
    await fragment.setData(body)

    // Set Location header and respond with fragment metadata
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error processing POST request for fragment. ${error.message}`);
    return res.status(error.code || 500).json(createErrorResponse(error.code || 500, `Failed to create fragment. ${error.message}`));
  }
};