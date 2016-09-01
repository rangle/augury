import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {TodoService} from './todo-service';

@Component({
  selector: 'todo-list',
  directives: [NgFor],
  template: `
  <table class="table table-bordered">
    <tr>
      <th>Title</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
    <tr *ngFor="let todo of todoService.todos">
      <td>{{todo.title}}</td>
      <td>
        <h4 [ngSwitch]="todo.status">
            <p class="label label-success"
             *ngSwitchCase="'started'">Started</p>
            <p class="label label-primary"
             *ngSwitchCase="'completed'">Completed</p>
        </h4>
      </td>
      <td><button
         class="btn btn-warning"
        (click)="todo.toggle()">Toggle</button></td>
    </tr>
  </table>
  `
})
export class TodoList {

  constructor(
    public todoService: TodoService
  ) {}
}
