import { compare } from './patch';

test('utils/patch: JSON patch should deal gracefully with undefined values', () => {
  const obj1 = { a: 'foo', b: undefined };
  const obj2 = { a: 'foo', b: undefined };

  const changes = compare(obj1, obj2);

  expect(changes).toEqual([]);
});

test('utils/patch: JSON patch can generate a changeset for simple objects', () => {
  const obj1 = { a: 'foo', b: 'bar' };
  const obj2 = { a: 'foo', b: 'foo' };

  const changes = compare(obj1, obj2);

  expect(changes).toEqual([{ op: 'replace', path: '/b', value: 'foo' }]);
});

test('utils/patch: JSON patch can generate a changeset for nested objects', () => {
  const obj1 = { a: 'foo', b: { fizz: 'bar' } };
  const obj2 = { a: 'foo', b: { fozz: 'bar' } };

  const changes = compare(obj1, obj2);

  expect(changes).toEqual([{ op: 'remove', path: '/b/fizz' }, { op: 'add', path: '/b/fozz', value: 'bar' }]);
});
