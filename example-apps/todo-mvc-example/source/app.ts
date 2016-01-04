// Load Global Styles
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

import {bootstrap} from 'angular2/bootstrap';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';

// For Batarangle Integration
import {AppViewListener} from 'angular2/src/core/linker/view_listener';
import {DebugElementViewListener, inspectNativeElement}
  from 'angular2/platform/common_dom';
import {bind} from 'angular2/core';

bootstrap(TodoList, [
  TodoStore,
  bind(AppViewListener).toClass(DebugElementViewListener)
])
.then(applicationReference => {
  const w: any = window;
  w.ng.probe = inspectNativeElement;
});
