// Load Global Styles
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

import {bootstrap} from 'angular2/bootstrap';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';

// For Batarangle Integration
import {AppView} from 'angular2/src/core/linker/view';

import {DomRootRenderer} from 'angular2/src/platform/dom/dom_renderer';
import {RootRenderer} from 'angular2/core';
import {DebugDomRootRenderer} from 'angular2/src/core/debug/debug_renderer';

import {bind} from 'angular2/core';

bootstrap(TodoList, [
  TodoStore,
  // bind(AppView).toClass(DebugDomRootRenderer)
  // bind(AppView).toClass(DebugDomRootRenderer)
  // bind(AppViewListener).toClass(DebugElementViewListener)
]);
