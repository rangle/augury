import {Component} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';
import {TodoService, TodoModel, FormatService} from './todo-service';

@Component({
  selector: 'todo-input',
  directives: [FORM_DIRECTIVES],
  template: `
  <div>
    <h1>Without Model</h1>
    <input type="text" #todo />
    <button (click)="onClick(todo)">Add Todo</button>
    <br/>
    <br/>
    <h2>With Model</h2>
    <form (ngSubmit)="onSubmit()">
      <input type="text" [(ngModel)]="todoModel.title" />
    </form>
  </div>
  `
})
export class TodoInput {
  todoModel: TodoModel = new TodoModel();

  constructor(
    public todoService: TodoService,
    public formatService: FormatService
  ) { }

  onSubmit() {
    this.todoService.addTodo(this.todoModel);
    this.todoModel = new TodoModel();
  }

  onClick(logMessage) {
    let tm = new TodoModel();
    tm.title = logMessage.value;
    this.todoService.addTodo(tm);
    logMessage.value = '';
  }
}
