import {Component} from 'angular2/core';

import {TodoService} from './todo-service';
import {TodoInput} from './todo-input';
import {TodoList} from './todo-list';

@Component({
  selector: 'todo-app',
  directives: [TodoInput, TodoList],
  template: `
  <div>
    <todo-input></todo-input>
    <hr/>
    <todo-list></todo-list>
  </div>
  `
})
export default class TodoApp { }
