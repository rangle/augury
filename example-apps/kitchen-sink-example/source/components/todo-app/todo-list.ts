import {Component, View} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {TodoService} from './todo-service';

@Component({
  selector: 'todo-list'
})
@View({
  directives: [NgFor],
  template: `
  <div>
    <p *ngFor="#todo of todoService.todos">
    <span [contentEditable]="todo.status == 'completed'">
      {{todo.title}}--{{todo.status}}
    </span>
    <button (click)="todo.toggle()">Toggle</button>
    </p>
  </div>
  `
})
export class TodoList {

  constructor(
    public todoService: TodoService
  ) {}
}
