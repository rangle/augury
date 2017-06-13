import { pathExists, getAtPath } from './property-path';

test('utils/property-path: pathExists', () => {
  const testObject = {
    testProp: 'a_value',
  };

  expect(pathExists(testObject, 'testProp')).toBe(true);
  expect(pathExists(testObject, 'nonExistentTestProp')).toBe(false);
});

test('utils/property-path: getAtPath', () => {
  const testObject = {
    testProp: 'a_value',
  };
  expect(getAtPath(testObject, 'testProp').value).toBe('a_value');
});
