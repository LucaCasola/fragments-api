// src/model/data/memory/index.js

const MemoryDB = require('./memory-db');

/**
 * @typedef {import('../../fragment').Fragment} Fragment
*/

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

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
 * Write a fragment's data buffer to memory db
 * @param {string} ownerId
 * @param {string} id
 * @param {Buffer} buffer
 * @returns {Promise<void>}
 */
function writeFragmentData(ownerId, id, buffer) {
  return data.put(ownerId, id, buffer);
}

/**
 * Read a fragment's data from memory db. Returns a Promise
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<any>}
 */
function readFragmentData(ownerId, id) {
  return data.get(ownerId, id);
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
function deleteFragment(ownerId, id) {
  return Promise.all([
    metadata.del(ownerId, id),  // Delete metadata
    data.del(ownerId, id)  // Delete data
  ]);
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
