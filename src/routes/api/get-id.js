// src/routes/api/get-id.js

const logger = require('../../logger');
const { Fragment, validTypes } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');

const convertMarkdownToHtml = async (markdown) => {
  const md = new MarkdownIt();
  const html = md.render(markdown);
  return html;
};

// Get a specific fragment by ID for the current user
module.exports = async (req, res) => {
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

    // Retrieve fragment by id. Will throw 404 if fragment is not found
    const fragment = await Fragment.byId(ownerId, fragmentId);

    // If no file extension is specified or file extension is the same, return the fragment data as is
    if (!format || format === fragment.mimeType) {
      logger.info(`No conversion necessary, returning fragment data as is`);
      const fragmentData = await fragment.getData();
      res.writeHead(200, { 'Content-Type': fragment.type, 'Content-Length': fragment.size });
      return res.end(fragmentData);
    } 
    // If the requested format is a supported conversion for the requested fragment
    else if (fragment.formats.includes(format)) {
      const fragmentData = await fragment.getData();
      
      // Markdown to HTML conversion
      if (fragment.type == 'text/markdown' && format === 'text/html') {
        logger.info(`Converting fragment's markdown data to HTML`);
        const htmlData = await convertMarkdownToHtml(fragmentData.toString());
        // Set headers (Content-Type and Content-Length) and status for HTML response
        res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(htmlData) });
        return res.end(htmlData);
      }
    } else {
      throw Object.assign(new Error(`Unsupported conversion format: ${format}`), { code: 400 });
    }
  } catch (error) {
    logger.error(`Error processing GET data request for fragment with id=${req.params.id}. ${error.message}`);
    return res.status(error.code || 500).json(createErrorResponse(error.code || 500, `Failed to get fragment data. ${error.message}`));
  }
};