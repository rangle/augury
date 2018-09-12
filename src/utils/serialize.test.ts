import * as test from 'tape';
import { serialize, deserialize, deserializationFailures } from './serialize';

test('utils/serialize: Serialize Array', t => {
  t.plan(1);

  const arrayObject = [1, 2, 3, 4];

  t.deepEqual(arrayObject, deserialize(serialize(arrayObject)), 'Serialize/deserialize simple array');

});

test('utils/serialize: Serialize Complex Array', t => {
  t.plan(1);

  const arrayObject = [{a_key: 'a_value'}, 2, 3, 4];

  t.deepEqual(arrayObject, deserialize(serialize(arrayObject)), 'Serialize/deserialize complex array');

});

test('utils/serialize: Serialize Simple Object', t => {
  t.plan(1);

  const simpleObj = {a_key: 'a_value'};

  t.deepEqual(simpleObj, deserialize(serialize(simpleObj)), 'Serialize/deserialize simple object');

});

test('utils/serialize: Serialize Map Object (string key & value)', t => {
  t.plan(2);

  const map = new Map();

  const mapKey = 'str_key';
  const mapVal = 'str_val';

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));
  o.forEach((v, k) => {
    t.deepEqual(mapKey, k, 'Serialize/deserialize key');
    t.deepEqual(mapVal, v, 'Serialize/deserialize value');
  });

});

test('utils/serialize: Serialize Map Object (object key & value)', t => {
  t.plan(2);

  const map = new Map();

  const mapKey = {'test': 'test_val'};
  const mapVal = {'str_key': 'str_value'};

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));

  o.forEach((v, k) => {
    t.deepEqual(mapKey, k, 'Serialize/deserialize key');
    t.deepEqual(mapVal, v, 'Serialize/deserialize value');
  });

});

test('utils/serialize: Serialize Map Object (number key & value)', t => {
  t.plan(2);
  const map = new Map();

  const mapKey = 100;
  const mapVal = 200;

  map.set(mapKey, mapVal);

  const o = deserialize(serialize(map));
  o.forEach((v, k) => {
    t.deepEqual(mapKey, k, 'Serialize/deserialize key');
    t.deepEqual(mapVal, v, 'Serialize/deserialize value');
  });
});

test('utils/serialize: log deserialization failure', t => {
  t.plan(1);

  try {
    deserialize('bogus object');
    t.fail();
  } catch (err) {
    t.deepEqual('bogus object', deserializationFailures[0].value);
  }
});
