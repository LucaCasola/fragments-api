const { _resetDBs, readFragment, readFragmentData, writeFragment, writeFragmentData, listFragments, deleteFragment } = require('../../src/model/data/memory');


describe('memory', () => {

  // Clear DBs before each test
  beforeEach(async () => {
    _resetDBs()
  });

  test('writeFragment() returns nothing on successful write',  async () => {
    const dataObj = { ownerId: 'a', id: 'b', value: 123 };
    const result = await writeFragment(dataObj);
    expect(result).toBe(undefined);
  });

  test('writeFragment() successfully overwrite existing fragment\'s metadata',  async () => {
    await writeFragment({ ownerId: 'a', id: 'b', value: 123 });  // initial write
    const result = await writeFragment({ ownerId: 'a', id: 'b', value: 300 });  // overwrite existing fragment
    expect(result).toBe(undefined);
    const value = await readFragment('a', 'b');
    expect(value).toEqual({ ownerId: 'a', id: 'b', value: 300 });
  });

  test('readFragment() on non-existent primaryKey & secondaryKey pair returns nothing',  async () => {
    const result = await readFragment('a', 'b');
    expect(result).toBe(undefined);
  });

  test('readFragment() with incorrect secondaryKey returns nothing',  async () => {
    writeFragment({ ownerId: 'a', id: 'b', value: 123 });
    const result = await readFragment('a', 'c');
    expect(result).toBe(undefined);
  });

  test('readFragment() returns metadata for what we writeFragment() into the db',  async () => {
    const data = { ownerId: 'a', id: 'b', value: 123 };
    writeFragment(data);
    const result = await readFragment('a', 'b');
    expect(result).toEqual(data);
  });

  test('writeFragmentData() returns nothing on successful write',  async () => {
    const result = await writeFragmentData('a', 'b', 123);
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() successfully overwrites existing fragment\'s data buffer',  async () => {
    await writeFragmentData('a', 'b', 123);  // initial write
    const result = await writeFragmentData('a', 'b', 300);  // overwrite existing fragment
    expect(result).toBe(undefined);
    const value = await readFragmentData('a', 'b');
    expect(value).toEqual(300);
  });

  test('readFragmentData() on non-existent primaryKey & secondaryKey pair returns nothing',  async () => {
    const result = await readFragmentData('a', 'b');
    expect(result).toBe(undefined);
  });

  test('readFragmentData() with incorrect secondaryKey returns nothing',  async () => {
    await writeFragmentData('a', 'b', 123);
    const result = await readFragmentData('a', 'c');
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns fragment\'s data for what we writeFragmentData() into the db',  async () => {
    await writeFragmentData('a', 'b', 123);
    const result = await readFragmentData('a', 'b');
    expect(result).toEqual(123);
  });

  test('writeFragment() expects string keys', () => {
    const dataObj = { ownerId: 1, id: 1, value: 123 };
    expect(async () => await writeFragment()).rejects.toThrow();
    expect(async () => await writeFragment()(dataObj)).rejects.toThrow();
  });

   test('readFragment() expects string keys', () => {
    expect(async () => await readFragment()).rejects.toThrow();
    expect(async () => await readFragment(1)).rejects.toThrow();
    expect(async () => await readFragment(1, 1)).rejects.toThrow();
  });
  
  test('writeFragmentData() expects string keys', () => {
    expect(async () => await writeFragmentData()).rejects.toThrow();
    expect(async () => await writeFragmentData(1)).rejects.toThrow();
    expect(async () => await writeFragmentData(1, 1, 123)).rejects.toThrow();
  });

  test('readFragmentData() expects string keys', () => {
    expect(async () => await readFragmentData()).rejects.toThrow();
    expect(async () => await readFragmentData(1)).rejects.toThrow();
    expect(async () => await readFragmentData(1, 1)).rejects.toThrow();
  }); 
});