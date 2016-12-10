import * as test from 'tape';
import {ParseUtils} from './parse-utils';
import {MutableTree} from '../../tree/mutable-tree';
import {createTree} from '../../tree/mutable-tree-factory';

test('utils/parse-utils: copyParent', t => {
  t.plan(1);
  const mockData = {
    name: 'mockData'
  };

  const result = {
    name: 'mockData',
    children: undefined
  };

  const parseUtils: ParseUtils = new ParseUtils();
  const output = parseUtils.copyParent(mockData);
  t.deepEqual(result, output, 'result should be equal to output');
  t.end();
});

test('utils/parse-utils: flatten list data', t => {
  t.plan(1);
  const mockData = [{
    id: '0',
    name: 'mockData',
    children: [{
      id: '0.1',
      name: 'one'
    }, {
      id: '0.2',
      name: 'two',
      children: [{
        id: '0.2.1',
        name: 'three'
      }, {
        id: '0.2.2',
        name: 'four'
      }]
    }]
  }];

  const result = [{
    children: undefined,
    id: '0',
    name: 'mockData'
  }, {
    id: '0.1',
    name: 'one'
    }, {
      children: undefined,
      id: '0.2',
      name: 'two'
  }, {
    id: '0.2.1',
    name: 'three'
    }, {
      id: '0.2.2',
      name: 'four'
  }];

  const parseUtils: ParseUtils = new ParseUtils();
  const output = parseUtils.flatten(<any> mockData);
  t.deepEqual(result, output, 'result should be equal to output');
  t.end();
});

test('utils/parse-utils: getParentHierarchy', t => {
  t.plan(1);
  const mockData = [{
    id: '0',
    name: 'mockData',
    children: [{
      id: '0 0',
      name: 'one'
    }, {
      id: '0 1',
      name: 'two',
      children: [{
        id: '0 1 0',
        name: 'three'
      }, {
        id: '0 1 1',
        name: 'four',
        children: []
      }]
    }]
  }];

  const node = {
    id: '0 1 1',
    name: 'four'
  };

  const tree = createTree(<any>mockData);

  const parseUtils: ParseUtils = new ParseUtils();
  const output = parseUtils.getParentHierarchy(tree, <any> node).map(n => n.id);

  const result = ['0', '0 1'];

  t.deepEqual(output, result, 'result should be equal to output');
  t.end();
});

test('utils/parse-utils: getParentNodeIds', t => {
  t.plan(1);
  const nodeId = '0 1 22 333 444';
  const parseUtils: ParseUtils = new ParseUtils();
  const output = parseUtils.getParentNodeIds(nodeId);
  const result = ['0', '0 1', '0 1 22', '0 1 22 333'];
  t.deepEqual(result, output, 'result should be equal to output');
  t.end();
});

test('utils/parse-utils: getDependencyLink', t => {
  t.plan(1);
  const node = {
    id: '0 2 2',
    name: 'four',
    injectors: ['service1'],
    providers: []
  };
  const mockData = [{
    id: '0',
    name: 'mockData',
    injectors: ['service1'],
    children: [{
      id: '0 1',
      name: 'one',
      injectors: ['service2']
    }, {
      id: '0 2',
      name: 'two',
      injectors: ['service3'],
      children: [{
        id: '0 2 1',
        name: 'three'
      }, node]
    }]
  }];

  const nodeId = '0 2 2';
  const dependency = { type: 'service1', decorators: [] };

  const parseUtils: ParseUtils = new ParseUtils();

  const tree = createTree(<any> mockData);

  const output = parseUtils.getDependencyProvider(tree, (<any>node), dependency);

  t.deepEqual(mockData[0], output, 'result should be equal to output');
  t.end();
});
