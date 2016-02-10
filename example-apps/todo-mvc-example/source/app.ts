// Load Global Styles
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

import {bootstrap} from 'angular2/bootstrap';
import {TodoList} from './components/todo-list';
import {TodoStore} from './stores/todo-store';

bootstrap(TodoList, [
  TodoStore
]);
