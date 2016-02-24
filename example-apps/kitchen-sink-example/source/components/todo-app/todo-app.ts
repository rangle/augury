import {Component, View, DirectiveResolver} from 'angular2/core';

import {TodoService} from './todo-service';
import {TodoInput} from './todo-input';
import {TodoList} from './todo-list';

const directiveResolver: DirectiveResolver = new DirectiveResolver();
console.log(directiveResolver.resolve(TodoInput));

@Component({
  selector: 'todo-app'
})
@View({
  directives: [TodoInput, TodoList],
  template: `
  <div>
    <todo-input></todo-input>
    <todo-list></todo-list>
  </div>
  `
})
export default class TodoApp { }
