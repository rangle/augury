import * as test from 'tape';

import {RenderState} from './render-state';

test('utils/render-state: init component', t => {
  t.plan(3);

  const comp: RenderState = new RenderState(<any>{});
  const value: any = {
    name: 'hello'
  };

  t.notEqual(comp, undefined, 'should not be undefined');
  t.deepEqual(comp.keys(value), ['name'], 'should have name as keys');
  t.doesNotThrow(() => comp.expandTree('name'), undefined, 'should not throw error on expanded');
  t.end();
});
