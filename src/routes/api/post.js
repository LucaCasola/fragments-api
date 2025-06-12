// src/routes/api/post.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');  // Used to create a success response object in HTTP responses


// Add a fragment to the user
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const body = req.body;  
    const type = req.headers['content-type'];

    logger.info(`ownerId received: ${ownerId}`)
    logger.info(`body received: ${body}`)
    logger.info(`type: ${type}`)
    
    // Validate supported Content-Type
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported Content-Type: ${type}`);
      return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
    }

    // Validate that body is not empty and is a buffer
    if (body === undefined || body === null || body.length === 0 || !Buffer.isBuffer(body)) {
      logger.warn('Request body is empty');
      return res.status(400).json(createErrorResponse(400, 'Request body must be a Buffer and must not be empty'));
    }

    const fragment = new Fragment({ ownerId: ownerId, type: type });
    await fragment.save();
    await fragment.setData(body)

    // Set Location header and respond with fragment metadata
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    res.status(201).json(createSuccessResponse(fragment));
  } catch (error) {
    res.status(500).json(createErrorResponse(500, error.message ));
  }
};