// src/routes/api/put-id.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response'); 

// Add a fragment for the current user
module.exports = async (req, res) => {
  const ownerId = req.user;
  const body = req.body;  
  const type = req.headers['content-type'];
  const fragmentId = req.params.id;

  logger.info(`ownerId received: ${ownerId}`)
  logger.info(`body received: ${body}`)
  logger.info(`type received: ${type}`)
  logger.info(`fragmentId received: ${fragmentId}`)
  
  try {
    // Throw if Content-Type is unsupported
    if (!Fragment.isSupportedType(type))
      throw Object.assign(new Error(`Unsupported Content-Type: ${type}`), { code: 415 });
    // Throw if body is empty or !Buffer
    if (body === undefined || body === null || body.length === 0 || !Buffer.isBuffer(body))
      throw Object.assign(new Error('Request body must be a Buffer and must not be empty'), { code: 400 });

    // Retrieve fragment by id. Will throw 404 if fragment is not found
    const fragment = await Fragment.byId(ownerId, fragmentId);

    // Throw if fragment.type does not match type received in request
    if (fragment.type !== type)
      throw Object.assign(new Error(`Fragment type mismatch: expected ${fragment.type}, received ${type}`), { code: 400 });

    // Update fragment data
    await fragment.save();
    await fragment.setData(body);

    // Respond with updated fragment metadata
    res.setHeader('Content-Length', fragment.size);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error processing PUT request for fragment with id=${req.params.id}. ${error.message}`);
    return res.status(error.code || 500).json(createErrorResponse(error.code || 500, `Failed to update fragment data. ${error.message}`));
  }
};