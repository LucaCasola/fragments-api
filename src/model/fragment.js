// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');

// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// Valid types for 'type' member of Fragment class
const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `text/csv`,
  `application/json`,
  `application/yaml`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/avif`,
  `image/gif`,
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // Ensure required values are provided
    if (ownerId == undefined && type == undefined) {
      throw new Error(`ownerId and type are required, got ownerId=${ownerId}, type=${type}`);
    }
    if (ownerId == undefined) {
      throw new Error(`ownerId is required, got ownerId=${ownerId}`);
    }
    if (type == undefined) {
      throw new Error(`type is required, got type=${type}`);
    }
    // Ensure size is is a positive number
    if (size < 0) {
      throw new Error(`size cannot be negative, got size=${size}`);
    }
    if (!Number.isInteger(size)) {
      throw new Error(`size must be an integer, got size=${size}`);
    }

    this.id = id || randomUUID();  // Assign random ID if none is provided
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;

    // Ensure type is valid
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`type is not valid, got type=${type}`);
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return await listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id. (gives object containing ownerId, type, and size)
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // Attempt to retrieve data. Throw if no data is retrieved
    const data = await readFragment(ownerId, id);
    if (!data) {
      logger.error(`Fragment with id=${id} does not exist`);
      const error = new Error(`Fragment with id=${id} does not exist`);
      error.code = 404;
      throw error;
    }

    try {
      const fragment = new Fragment({id, ownerId, created: data.created, updated: data.updated, type: data.type, size: data.size});
      return fragment;
    } catch (error) {
      logger.error(`Failed to create return fragment after retrieving data for fragment with id=${id}. Error: ${error.message}`);
      throw new Error(`Failed to create return fragment after retrieving data for fragment with id=${id}.`);
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    try {
      return await deleteFragment(ownerId, id);
    } catch {
      logger.error(`Fragment with id=${id} does not exist`);
      const error = new Error(`Fragment with id=${id} does not exist`);
      error.code = 404;
      throw error;
    }
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();  // Update 'updated' value to current date & time
    try {
      await writeFragment(this);
    } catch (error) {
      logger.error(`Failed to save fragment with id=${this.id} for userId=${this.ownerId}. Error: ${error.message}`);
      throw new Error(`Failed to save fragment: ${this.id}, ${error}`);
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    try {
      if (data == undefined) {
        throw new Error(`buffer is required, got buffer=${data}}`);
      }
      this.size = data.length;
      await this.save()
      await writeFragmentData(this.ownerId, this.id, data);
    } catch (error) {
      logger.error(
        `Failed to save fragment with id=${this.id} for userId=${this.ownerId}. Error: ${error.message}`
      );
      throw new Error(`Failed to save fragment: ${this.id}, ${error}`);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const typeFirstFiveChars = this.type.slice(0, 5);
    return typeFirstFiveChars == 'text/';
  }

  /**
   * Returns true if this fragment is an image/* mime type
   * @returns {boolean} true if fragment's type is image/*
   */
  get isImage() {
    const typeFirstSixChars = this.type.slice(0, 6);
    return typeFirstSixChars == 'image/';
  }

  /**
   * Returns true if this fragment is an application/* mime type
   * @returns {boolean} true if fragment's type is application/*
   */
  get isApplication() {
    const typeFirstTwelveChars = this.type.slice(0, 12);
    return typeFirstTwelveChars == 'application/';
  }

  /**
   * Returns the subtype for the fragment's type
   * @returns {string} subtype of the fragment's type/*
   */
  get subtype() {
    let primaryType = String(this.mimeType);
    let subtype = undefined;

    if (this.isText) {
      subtype = primaryType.slice(5);  // should equal one of:  plain, markdown, html, or csv
    } else if (this.isApplication) {
      subtype = primaryType.slice(12);  // should equal one of:  json or yaml
    } else if (this.isImage) {
      subtype = primaryType.slice(6);  // should equal one of:  png, jpeg, webp, avif, or gif
    } 

    return subtype;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let formats = []

    switch (this.subtype) {
      // Start of 'text' types
      case 'plain':
        logger.info(`text/plain type detected`);
        formats = ['text/plain'];
        break;
      case 'markdown':
        logger.info(`text/markdown type detected`);
        formats = ['text/markdown', 'text/html', 'text/plain'];
        break;
      case 'html':
        logger.info(`text/html type detected`);
        formats = ['text/html', 'text/plain'];
        break;
      case 'csv':
        logger.info(`text/csv type detected`);
        formats = ['text/csv', 'text/plain', 'application/json'];
        break;
      // Start of 'application' types
      case 'json':
        logger.info(`application/json type detected`);
        formats = ['application/json', 'application/yaml', 'application/yml', 'text/plain'];
        break;
      case 'yaml':
        logger.info(`application/yaml type detected`);
        formats = ['application/yaml', 'text/plain'];
        break;
      // Start of 'image' types
      case 'png':
      case 'jpeg':
      case 'webp':
      case 'avif':
      case 'gif':
        logger.info(`image/png type detected`);
        formats = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
        break;
      default:
        logger.error(`Error: Unknown application type detected: ${this.type}`);
    }

    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    let isSupported = false;
    let mimeType = value;

    // Try to parse out the MIME type if there are parameters
    try {
      mimeType = contentType.parse(value).type;
    } catch {
      // If parsing fails, fallback to the original value
      mimeType = value;
    }

    for (const format of validTypes) {
      if (format == mimeType) {
        isSupported = true;
        break;
      }
    }

    return isSupported;
  }
}

module.exports.Fragment = Fragment;

module.exports.validTypes = validTypes;