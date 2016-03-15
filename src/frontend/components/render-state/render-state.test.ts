import * as test from 'tape';
import RenderState from './render-state';

test('utils/render-state: init component', t => {
  t.plan(4);
  const comp: RenderState = new RenderState();
  const value: any = {
    name: 'hello'
  };

  t.notEqual(comp, undefined, 'should not be undefined');
  t.deepEqual(comp.type(value), 'object', 'type should be object');
  t.deepEqual(comp.keys(value), ['name'], 'should have name as keys');
  t.doesNotThrow(() => {
    comp.expandTree('name', new CustomEvent('test'))
  }, undefined, 'should not throw error on expanded');

  t.end();
})
