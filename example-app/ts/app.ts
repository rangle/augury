import {bootstrap, bind} from 'angular2/angular2';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';
// import { AppViewListener } from 'angular2/src/core/compiler/view_listener.js';
// import { DebugElementViewListener } from 'angular2/src/core/debug/debug_element_view_listener';

var AppViewListener = require('angular2/src/core/compiler/view_listener').AppViewListener;
var DebugElementViewListener = require('angular2/src/core/debug/debug_element_view_listener').DebugElementViewListener;


let appRefPromise = bootstrap(TodoList, [
  bind(TodoStore).toClass(TodoStore),
  bind(AppViewListener).toClass(DebugElementViewListener)
])
.then(applicationReference => {
  window['applicationReference'] = applicationReference;
});
