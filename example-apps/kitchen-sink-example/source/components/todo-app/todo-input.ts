import {Component} from '@angular/core';
import {FORM_PROVIDERS, REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup}
 from '@angular/forms';
import {TodoService, TodoModel, FormatService} from './todo-service';

@Component({
  selector: 'todo-input',
  template: `
  <div>
    <form (ngSubmit)="onSubmit()"  class="form-inline">
      <input type="text" [(ngModel)]="todoModel.title"
       required class="form-control" name="title" />
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
