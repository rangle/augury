import * as test from 'tape';
import {Injector, provide} from 'angular2/core';
import {ComponentDataStore} from '../component-data/component-data-store';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType, UserActionType} from '../../actions/action-constants';

test('frontend/component-data-store: component changes', t => {

  const mockDispatcher = new Dispatcher();
  const injector = Injector.resolveAndCreate([
    ComponentDataStore,
    provide(Dispatcher, {useValue: mockDispatcher})
  ]);

  const componentStore = injector.get(ComponentDataStore);
  const mockData = [{
    name: 'TodoList',
    children: [{
      id: '0.0',
      name: 'INPUT'
    }, {
      id: '0.1',
      name: 'NgIf'
    }]
  }];

  componentStore.dataStream.subscribe((data: any) => {
    t.deepEqual(data, {
      action: 'START_COMPONENT_TREE_INSPECTION',
      componentData: mockData,
      openedNodes: [],
      selectedNode: undefined
    }, 'emits component tree change event');
  });

  mockDispatcher.messageBus.next({
    actionType: BackendActionType.COMPONENT_TREE_CHANGED,
    componentData: mockData
  });

  t.end();

});

test('frontend/component-data-store: user selects tree node', t => {

  const mockDispatcher = new Dispatcher();
  const injector = Injector.resolveAndCreate([
    ComponentDataStore,
    provide(Dispatcher, {useValue: mockDispatcher})
  ]);

  const componentStore = injector.get(ComponentDataStore);
  const mockData = {
    id: '0.0',
    name: 'INPUT'
  };

  componentStore.dataStream.subscribe((data: any) => {
    t.deepEqual(data.selectedNode,
    {
      actionType: 'SELECT_NODE',
      node: mockData
    }, 'emits user selects node event');
  });

  mockDispatcher.messageBus.next({
    actionType: UserActionType.SELECT_NODE,
    node: mockData
  });

  t.end();

});

test('frontend/component-data-store: user searches for node', t => {

  const mockDispatcher = new Dispatcher();
  const componentStore = new ComponentDataStore(mockDispatcher);
  const mockData = [{
    name: 'TodoList',
    children: [{
      id: '0.0',
      name: 'INPUT'
    }, {
      id: '0.1',
      name: 'NgIf'
    }]
  }];

  const mockQuery = 'input';

  componentStore.dataStream
  .filter((data: any) => data.selectedNode)
  .subscribe((data: any) => {
    t.deepEqual(data.selectedNode, {
      id: '0.0',
      name: 'INPUT'
    }, 'emits user\'s successful search for node event');
  });

  mockDispatcher.messageBus.next({
    actionType: BackendActionType.COMPONENT_TREE_CHANGED,
    componentData: mockData
  });

  mockDispatcher.messageBus.next({
    actionType: UserActionType.SEARCH_NODE,
    query: mockQuery
  });

  t.end();

});
