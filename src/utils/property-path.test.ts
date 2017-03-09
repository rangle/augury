import * as test from 'tape';

import {
  pathExists,
  getAtPath,
} from './property-path';

test('utils/property-path: pathExists', t => {
  t.plan(2);

  const testObject = {
    testProp: 'a_value'
  };

  t.true(pathExists(testObject, 'testProp'), 'exists');
  t.false(pathExists(testObject, 'nonExistentTestProp'), 'does not exist');

});

test('utils/property-path: getAtPath', t => {
  t.plan(1);

  const testObject = {
    testProp: 'a_value'
  };

  t.equal(getAtPath(testObject, 'testProp').value, 'a_value');

});
