import * as test from 'tape';

import {compare} from './patch';

test('utils/patch: JSON patch should deal gracefully with undefined values', t => {
  t.plan(3);

  const obj1 = {a: 'foo', b: undefined};
  const obj2 = {a: 'foo', b: undefined};

  const changes = compare(obj1, obj2);

  t.ok(changes, 'changes is not null');
  t.ok(Array.isArray(changes), 'changes is an array');
  t.notOk(changes.length, 'objects should compare as identical');

  t.end();
});

test('utils/patch: JSON patch can generate a changeset for simple objects', t => {
  t.plan(5);

  const obj1 = {a: 'foo', b: 'bar'};
  const obj2 = {a: 'foo', b: 'foo'};

  const changes = compare(obj1, obj2);

  t.ok(changes, 'changes is not null');
  t.ok(Array.isArray(changes), 'changes is an array');
  t.equals(1, changes.length, 'changes should contain one change');
  t.equals('replace', changes[0].op, 'operation should be a "replace" op');
  t.equals('/b', changes[0].path, 'paths should point to "b" property');

  t.end();
});

test('utils/patch: JSON patch can generate a changeset for nested objects', t => {
  t.plan(8);

  const obj1 = {a: 'foo', b: {fizz: 'bar'}};
  const obj2 = {a: 'foo', b: {fozz: 'bar'}};

  const changes = compare(obj1, obj2);

  t.ok(changes, 'changes is not null');
  t.ok(Array.isArray(changes), 'changes is an array');
  t.equals(2, changes.length, 'changes should contain two changes');
  t.equals('remove', changes[0].op, 'first operation should be a "remove" op');
  t.equals('/b/fizz', changes[0].path, 'first operation should delete "/b/fizz"');
  t.equals('add', changes[1].op, 'second operation should be an "add" op');
  t.equals('/b/fozz', changes[1].path, 'second operation should add "/b/fozz"');
  t.equals('bar', changes[1].value, 'second operation should have a value of "bar"');

  t.end();
});

