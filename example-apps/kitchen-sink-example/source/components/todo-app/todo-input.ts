import {Component} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';
import {TodoService, TodoModel, FormatService} from './todo-service';

@Component({
  selector: 'todo-input',
  directives: [FORM_DIRECTIVES],
  template: `
  <div>
    <h4>Without Model</h4>
    <form (ngSubmit)="onClick(todo)" class="form-inline">
      <input type="text" #todo required class="form-control" />
      <button class="btn btn-success">Add Todo</button>
    </form>
    <hr/>
    <h4>With Model</h4>
    <form (ngSubmit)="onSubmit()"  class="form-inline">
      <input type="text" [(ngModel)]="todoModel.title"
       required class="form-control"  />
      <button class="btn btn-success">Add Todo</button>
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
