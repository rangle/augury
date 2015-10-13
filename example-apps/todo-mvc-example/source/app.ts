import {bootstrap, bind, inspectNativeElement} from 'angular2/angular2';
import {enableDebugTools} 'angular2/tools';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';

//import {AppViewListener, DebugElementViewListener} from 'angular2/core';
//import {ELEMENT_PROBE_BINDINGS} from 'angular2/src/core/debug';
//import {DebugElementViewListener} from 'angular2/src/core/debug/debug_element_view_listener';

bootstrap(TodoList, [
  TodoStore,
  //bind(AppViewListener).toClass(DebugElementViewListener)
])
  .then(applicationReference => enableDebugTools(applicationReference));
