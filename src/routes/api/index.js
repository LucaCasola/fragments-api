// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Define get route
router.get('/fragments', require('./get'));

// Define get by id route
router.get('/fragments/:id', require('./get-id'));

// Define get info by id route
router.get('/fragments/:id/info', require('./get-id-info'));

// Define post route
// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), require('./post'));

// Define delete by id route
router.delete('/fragments/:id', require('./delete-id'));

module.exports = router;