import {Component} from '@angular/core';

import {TodoService} from './todo-service';

@Component({
  selector: 'todo-app',
  template: `
  <div>
    <todo-input></todo-input>
    <hr/>
    <todo-list></todo-list>
  </div>
  `
})
export default class TodoApp { }
