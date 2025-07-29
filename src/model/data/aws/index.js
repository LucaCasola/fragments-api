// src/model/data/memory/index.js

// TODO: temporary use of memory-db until we add DynamoDB
const MemoryDB = require('../memory/memory-db');
const logger = require('../../../logger');

const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');

/**
 * @typedef {import('../../fragment').Fragment} Fragment
*/

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream.

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });



/**
 * Write a fragment's metadata to memory db
 * @param {Fragment} fragment
 * @returns {Promise<void>}
 */
function writeFragment(fragment) {
  // Simulate db/network serialization of the value, storing only JSON representation.
  // This is important because it's how things will work later with AWS data stores.
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

/**
 * Read a fragment's metadata from memory db
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function readFragment(ownerId, id) {
  // This data is be raw JSON, so we turn it back into a Fragment object higher in the call stack
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

/**
 * Writes a fragment's data to an S3 Object in a Bucket
 * @param {string} ownerId
 * @param {string} id
 * @param {Buffer} buffer
 * @returns {Promise<void>}
 */
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

/**
 * Reads a fragment's data from S3 and returns (Promise<Buffer>)
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<any>}
 */
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

/**
 * Get a list of fragment IDs or full fragment objects for a given user from the memory db
 * @param {string} ownerId
 * @param {boolean} [expand=false] - If true, return full fragment objects; if false, return only fragment IDs
 * @returns {Promise<Array<Object>|Array<string>>} - A promise that resolves to an array of fragment IDs or objects
 */
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  // If no fragments are found, return an empty array
  if (!fragments || fragments.length === 0) {
    return [];
  }
  
  const parsedFragments = fragments.map((fragment) => JSON.parse(fragment));

  // If we are supposed to give expanded fragments, return the full objects
  if (expand || !fragments) {
    return parsedFragments;
  }
  // Otherwise, map to only send back the ids
  return parsedFragments.map((fragment) => fragment.id);
}

/**
 * Delete a fragment's metadata and data from memory db
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<any>}
 */
async function deleteFragment(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a DELETE Object command to send to S3
  const command = new DeleteObjectCommand(params);

  try {
    // Use our client to send the command
    const deleteResult = await s3Client.send(command);
    logger.info('\n\n\n\nDelete result:', deleteResult);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error removing fragment from S3');
    throw new Error('unable to remove fragment data');
  }

  // Delete metadata from memory db
  return metadata.del(ownerId, id);
}

// INTERNAL USE ONLY - clear DBs. used for testing
function _resetDBs() {
  data.db = {};
  metadata.db = {};
}

// Do not export function in production environment
if (process.env.NODE_ENV !== 'production') {
  module.exports._resetDBs = _resetDBs;
}
module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
