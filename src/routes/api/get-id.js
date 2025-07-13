// src/routes/api/get-id.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Get a specific fragment by ID for the current user
module.exports = async (req, res) => {
  // Get request parameters
  const reqId = req.params.id;  // Get the ID + ext (if ext is included) from the request parameters (ex: 123-12344-541-123.txt)
  const ownerId = req.user;  // Get the owner ID from the authenticated user

  let fragmentId = reqId;
  let fileExtension;  

  if (reqId.lastIndexOf('.') !== -1) {
    fragmentId = reqId.substring(0, reqId.lastIndexOf('.'));
    fileExtension = reqId.substring(reqId.lastIndexOf('.') + 1);
    // Convert file extension to a MIME type
    switch (fileExtension) {
      case 'txt':
        fileExtension = 'text/plain';
        break;
      case 'md':
        fileExtension = 'text/markdown';
        break;
      case 'html', 'csv':
        fileExtension = 'text/' + fileExtension;
        break;
      case 'json', 'yaml':
        fileExtension = 'application/' + fileExtension;
        break;      
      case 'png', 'jpeg', 'webp', 'avif', 'gif':
        fileExtension = 'application/' + fileExtension;
        break;
      default:
        logger.error(`Error: Unknown application type detected: ${fileExtension}`);
    }
  } else {
    fileExtension = undefined;
  }

  try {
    logger.info(`Fetching fragment: ${fragmentId}, for user: ${ownerId}`);
    const fragment = await Fragment.byId(ownerId, fragmentId);
    const supportedFormats = fragment.formats;

    // If no file extension is specified or file extension is the same, return the fragment data as is
    if (!fileExtension || fileExtension === fragment.type) {
      logger.info(`No conversion necessary, returning fragment data as is`);
      const fragmentData = await fragment.getData();
      return res.status(200).json(createSuccessResponse({ type: fragment.type, data: fragmentData.toString() }));
    } 
    // If the requested file extension is supported, convert to that format and return
    else if (supportedFormats.includes(fileExtension)) {
      logger.info(`Converting fragment data to requested format: ${fileExtension}`);
      res.set('Content-Type', fileExtension);
      const fragmentData = await fragment.getData();
      if (fileExtension === 'text/plain' || fileExtension === 'text/markdown') {
        return res.status(200).json(createSuccessResponse({ type: fileExtension, data: fragmentData.toString() }));
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion to format: ${fileExtension}`));
      }
    } 
    // If the file extension is not supported, return an error
    else {
      logger.warn(`Unsupported file extension: ${fileExtension} for fragmentId: ${fragmentId} with type: ${fragment.type}`);
      return res.status(415).json(createErrorResponse(415, `Unsupported file extension: ${fileExtension} for fragmentId: ${fragmentId} with type: ${fragment.type}`));
    }
  } catch (err) {
    logger.error(`Error fetching fragment ${fragmentId}: ${err.message}`);
    return res.status(404).json(createErrorResponse(404, `Fragment not found for fragmentId: ${fragmentId}`));
  }
};