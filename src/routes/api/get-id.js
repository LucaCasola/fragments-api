// src/routes/api/get-id.js

const logger = require('../../logger');
const { Fragment, validTypes } = require('../../model/fragment');

// Used to create a success response object in HTTP responses
const { createErrorResponse } = require('../../response');

const MarkdownIt = require('markdown-it');

const convertMarkdownToHtml = async (markdown) => {
  const md = new MarkdownIt();
  const html = md.render(markdown);
  return html;
};

// Get a specific fragment by ID for the current user
module.exports = async (req, res) => {
  // Get request parameters
  const reqId = req.params.id;  // Get the ID + ext (if ext is included) from the request parameters (ex: 123-12344-541-123.txt)
  const ownerId = req.user;  // Get the owner ID from the authenticated user
  var fragmentId = reqId;
  var format;  

  // If the request ID includes a file extension, extract it and set the format
  if (reqId.lastIndexOf('.') !== -1) {
    fragmentId = reqId.substring(0, reqId.lastIndexOf('.'));
    format = reqId.substring(reqId.lastIndexOf('.') + 1);

    for (const validType of validTypes) {
      if (validType.includes(format)) {
        format = validType;
        break;
      }
    }
  } else {
    format = undefined;
  }

  try {
    logger.info(`Fetching fragment: ${fragmentId}, for user: ${ownerId}`);
    const fragment = await Fragment.byId(ownerId, fragmentId);

    // If no file extension is specified or file extension is the same, return the fragment data as is
    if (!format || format === fragment.mimeType) {
      logger.info(`No conversion necessary, returning fragment data as is`);
      const fragmentData = await fragment.getData();
      res.set('Content-Type', fragment.mimeType);
      res.set('Content-Length', fragment.size);
      return res.status(200).send(fragmentData.toString());
    } 
    // If the requested format is a supported conversion for the requested fragment
    else if (fragment.formats.includes(format)) {
      const fragmentData = await fragment.getData();
      
      // Markdown to HTML conversion
      if (fragment.type == 'text/markdown' && format === 'text/html') {
        logger.info(`Converting fragment's markdown data to HTML`);
        const htmlData = await convertMarkdownToHtml(fragmentData.toString());
        res.set('Content-Type', 'text/html');
        res.set('Content-Length', Buffer.byteLength(htmlData));
        return res.status(200).send(htmlData);
      }
    } else {
      logger.warn(`Unsupported format requested: ${format} for fragment ID: ${fragmentId}`);
      return res.status(400).json(createErrorResponse(400, `Unsupported format requested: ${format}`));
    }
  } catch (err) {
    logger.error(`Error fetching fragment ${fragmentId}: ${err.message}`);
    return res.status(404).json(createErrorResponse(404, `Fragment not found for fragmentId: ${fragmentId}`));
  }
};