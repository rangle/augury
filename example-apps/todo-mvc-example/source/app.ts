import {bootstrap, bind} from 'angular2/angular2';
import {enableDebugTools} from 'angular2/tools';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';

import {AppViewListener} from 'angular2/src/core/linker/view_listener.js';
import {DebugElementViewListener, inspectNativeElement} from 'angular2/src/core/debug/debug_element_view_listener';

bootstrap(TodoList, [
  TodoStore,
  bind(AppViewListener).toClass(DebugElementViewListener)
])
  .then(applicationReference => {
    enableDebugTools(applicationReference);
    window['ng']['probe'] = inspectNativeElement; 
  });
