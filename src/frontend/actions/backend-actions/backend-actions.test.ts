import * as test from 'tape';
import {ReflectiveInjector, provide} from '@angular/core';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActions} from '../backend-actions/backend-actions';
import {BackendActionType} from '../action-constants.ts';

test('frontend/backend-actions: component tree changed', t => {

  const mockDispatcher = new Dispatcher();
  const injector = ReflectiveInjector.resolveAndCreate([
    BackendActions,
    provide(Dispatcher, {useValue: mockDispatcher})
  ]);
  const backendActions = injector.get(BackendActions);
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

  mockDispatcher.messageBus.subscribe((data: any) => {
    t.deepEqual(data, {
        actionType: BackendActionType.COMPONENT_TREE_CHANGED,
        componentData: mockData
      }, 'emits component tree change event');
  });

  backendActions.componentTreeChanged(mockData);

  t.end();
});
