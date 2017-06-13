import { serialize, deserialize } from './serialize';

test('utils/serialize: Serialize Array', () => {
  const arrayObject = [1, 2, 3, 4];

  expect(arrayObject).toEqual(deserialize(serialize(arrayObject)));
});

test('utils/serialize: Serialize Complex Array', () => {
  const arrayObject = [{ a_key: 'a_value' }, 2, 3, 4];

  expect(arrayObject).toEqual(deserialize(serialize(arrayObject)));
});

test('utils/serialize: Serialize Simple Object', () => {
  const simpleObj = { a_key: 'a_value' };

  expect(simpleObj).toEqual(deserialize(serialize(simpleObj)));
});

test('utils/serialize: Serialize Map Object (string key & value)', () => {
  const map = new Map();

  const mapKey = 'str_key';
  const mapVal = 'str_val';

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));
  o.forEach((v, k) => {
    expect(mapKey).toEqual(k);
    expect(mapVal).toEqual(v);
  });
});

test('utils/serialize: Serialize Map Object (object key & value)', () => {
  const map = new Map();

  const mapKey = { test: 'test_val' };
  const mapVal = { str_key: 'str_value' };

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));

  o.forEach((v, k) => {
    expect(mapKey).toEqual(k);
    expect(mapVal).toEqual(v);
  });
});

test('utils/serialize: Serialize Map Object (number key & value)', () => {
  const map = new Map();

  const mapKey = 100;
  const mapVal = 200;

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));
  o.forEach((v, k) => {
    expect(mapKey).toEqual(k);
    expect(mapVal).toEqual(v);
  });
});
