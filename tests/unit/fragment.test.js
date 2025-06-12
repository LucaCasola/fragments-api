const { Fragment } = require('../../src/model/fragment');

// Wait for a certain number of ms (default 50). Feel free to change this value
// if it isn't long enough for your test runs. Returns a Promise.
const wait = async (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

describe('Fragment class', () => {
  describe('Fragment()', () => {
    test('ownerId and type are required', () => {
      expect(() => new Fragment({})).toThrow();
    });

    test('ownerId is required', () => {
      expect(() => new Fragment({ type: 'text/plain', size: 1 })).toThrow();
    });

    test('type is required', () => {
      expect(() => new Fragment({ ownerId: '1234', size: 1 })).toThrow();
    });

    test('type can be a simple media type', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      expect(fragment.type).toEqual('text/plain');
    });

    test('type can include a charset', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.type).toEqual('text/plain; charset=utf-8');
    });

    test('invalid types throw', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'application/msword', size: 1 })).toThrow();
    });

    test('valid types can be set', () => {
      validTypes.forEach((format) => {
        const fragment = new Fragment({ ownerId: '1234', type: format, size: 1 });
        expect(fragment.type).toEqual(format);
      });
    });

    test('size gets set to 0 if missing', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain' });
      expect(fragment.size).toBe(0);
    });

    test('size must be a number', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: '1' })).toThrow();
    });

    test('size can be 0', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 })).not.toThrow();
    });

    test('size cannot be negative', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: -1 })).toThrow();
    });

    test('fragments have an id', () => {
      const fragment = new Fragment({ 
        ownerId: '1234', 
        type: 'text/plain', 
        size: 1 
      });
      expect(fragment.id).toMatch(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      );
    });

    test('fragments use id passed in if present', () => {
      const fragment = new Fragment({
        id: 'id',
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(fragment.id).toEqual('id');
    });

    test('fragments get a created datetime string', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(Date.parse(fragment.created)).not.toBeNaN();
    });

    test('fragments get an updated datetime string', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(Date.parse(fragment.updated)).not.toBeNaN();
    });
  });

  describe('isSupportedType()', () => {
    test('isSupportedType() returns true for supported text types, with and without charset', () => {
      expect(Fragment.isSupportedType('text/plain')).toBe(true);
      expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    });

    test('isSupportedType() returns false for unsupported types', () => {
      expect(Fragment.isSupportedType('application/octet-stream')).toBe(false);
      expect(Fragment.isSupportedType('application/msword')).toBe(false);
      expect(Fragment.isSupportedType('audio/webm')).toBe(false);
      expect(Fragment.isSupportedType('video/ogg')).toBe(false);
    });

    test('isSupportedType() returns false if content-type parsing fails', () => {
      const invalidType = 'not a valid content type';  // Pass an invalid content-type string to force parse to throw
      const result = Fragment.isSupportedType(invalidType);
      expect(result).toBe(false);
    });
  });

  describe('mimeType()', () => {
    test('mimeType() returns the mime type for type with parameter', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.mimeType).toEqual('text/plain');
    });

    test('mimeType() returns the mime type for type without parameters', () => {
      const fragment = new Fragment({ 
        ownerId: '1234', 
        type: 'text/plain', 
      size: 0 
      });
      expect(fragment.mimeType).toEqual('text/plain');
    });
  });

  describe('isText(), isApplication(), isImage(), subtype()', () => {
    test('isText() returns true for text fragments', () => {
      // Text fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.isText).toBe(true);
    });

    test('isText() returns false for non-text fragments', () => {
      // Non-text fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      expect(fragment.isText).toBe(false);
    });

    test('isApplication() returns true for application fragments', () => {
      // Application fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/json',
        size: 0,  
      });
      expect(fragment.isApplication).toBe(true);  
    });

    test('isApplication() returns false for non-application fragments', () => {
      // Non-application fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 0,
      });
      expect(fragment.isApplication).toBe(false);
    });

    test('isImage() returns true for image fragments', () => {
      // Image fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      expect(fragment.isImage).toBe(true);
    });

    test('isImage() returns false for non-image fragments', () => {
      // Non-image fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.isImage).toBe(false);
    });

    test('subtype() returns the correct subtype for text fragments', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.subtype).toEqual('plain');
    });

    test('subtype() returns the correct subtype for application fragments', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/json',
        size: 0,
      });
      expect(fragment.subtype).toEqual('json');
    });

    test('subtype() returns the correct subtype for image fragments', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      expect(fragment.subtype).toEqual('png');
    });

    test('subtype() returns undefined subtype for unknown fragments', () => {
      // Mock isSupportedType to always return true to simulate an unsupported type
      jest.spyOn(Fragment, 'isSupportedType').mockReturnValue(true);
      
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'invalid/type',
        size: 0,
      });
      expect(fragment.subtype).toBe(undefined);

      // Restore the original implementation after the test
      Fragment.isSupportedType.mockRestore();
    });
  });

  describe('save(), getData(), setData(), byId(), byUser(), delete()', () => {
    test('byUser() returns an empty array if there are no fragments for this user', async () => {
      expect(await Fragment.byUser('1234')).toEqual([]);
    });

    test('a fragment can be created and save() stores a fragment for the user', async () => {
      const data = Buffer.from('hello');
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      const fragment2 = await Fragment.byId('1234', fragment.id);
      expect(fragment2).toEqual(fragment);
      expect(await fragment2.getData()).toEqual(data);
    });

    test('save() updates the updated date/time of a fragment', async () => {
      const ownerId = '7777';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      const modified1 = fragment.updated;
      await wait();
      await fragment.save();
      const fragment2 = await Fragment.byId(ownerId, fragment.id);
      expect(Date.parse(fragment2.updated)).toBeGreaterThan(Date.parse(modified1));
    });

    test('setData() updates the updated date/time of a fragment', async () => {
      const data = Buffer.from('hello');
      const ownerId = '7777';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      const modified1 = fragment.updated;
      await wait();
      await fragment.setData(data);
      await wait();
      const fragment2 = await Fragment.byId(ownerId, fragment.id);
      expect(Date.parse(fragment2.updated)).toBeGreaterThan(Date.parse(modified1));
    });

    test('setData() throws if data is undefined', async () => {
      const fragment = new Fragment({ ownerId: 'testuser', type: 'text/plain', size: 0 });
      await fragment.save();
      await expect(fragment.setData()).rejects.toThrow();
    });

    test("a fragment is added to the list of a user's fragments", async () => {
      const data = Buffer.from('hello');
      const ownerId = '5555';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      expect(await Fragment.byUser(ownerId)).toEqual([fragment.id]);
    });

    test('full fragments are returned when requested for a user', async () => {
      const data = Buffer.from('hello');
      const ownerId = '6666';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      expect(await Fragment.byUser(ownerId, true)).toEqual([fragment]);
    });

    test('setData() throws if not give a Buffer', () => {
      const fragment = new Fragment({ ownerId: '123', type: 'text/plain', size: 0 });
      expect(() => fragment.setData()).rejects.toThrow();
    });

    test('setData() updates the fragment size', async () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(Buffer.from('a'));
      expect(fragment.size).toBe(1);

      await fragment.setData(Buffer.from('aa'));
      const { size } = await Fragment.byId('1234', fragment.id);
      expect(size).toBe(2);
    });

    test('a fragment can be deleted', async () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(Buffer.from('a'));

      await Fragment.delete('1234', fragment.id);
      expect(() => Fragment.byId('1234', fragment.id)).rejects.toThrow();
    });
  });

  describe('formats()', () => {
    test('formats() returns the expected result for plain text', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 0,
      });
      expect(fragment.formats).toEqual(['text/plain']);
    });

    test('formats() returns the expected result for markdown', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/markdown',
        size: 0,
      });
      expect(fragment.formats).toEqual(['text/markdown', 'text/html', 'text/plain']);
    });

    test('formats() returns the expected result for HTML', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/html',
        size: 0,
      });
      expect(fragment.formats).toEqual(['text/html', 'text/plain']);
    });

    test('formats() returns the expected result for CSV', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/csv',
        size: 0,
      });
      expect(fragment.formats).toEqual(['text/csv', 'text/plain', 'application/json']);
    });

    test('formats() returns the expected result for JSON', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/json',
        size: 0,
      });
      expect(fragment.formats).toEqual(['application/json', 'application/yaml', 'application/yml', 'text/plain']);
    });

    test('formats() returns the expected result for YAML', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/yaml',
        size: 0,
      });
      expect(fragment.formats).toEqual(['application/yaml', 'text/plain']);
    });

    test('formats() returns the expected result for image formats', () => {
      const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
      imageTypes.forEach((type) => {
        const fragment = new Fragment({
          ownerId: '1234',
          type: type,
          size: 0,
        });
        expect(fragment.formats).toEqual(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']);
      });
    });

    test('formats() returns an empty array for unsupported types', () => {
      // Mock isSupportedType to always return true to simulate an unsupported type
      jest.spyOn(Fragment, 'isSupportedType').mockReturnValue(true);

      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/msword',
        size: 0,
      });
      expect(fragment.formats).toEqual([]);
    });
  });
});