import {Component, View, NgIf, NgFor, Inject} from 'angular2/angular2';
import {TodoStore} from '../stores/todo-store';
import {Todo} from '../domain/todo';

@Component({
  selector: 'todo-item',
  properties: ['todo']
})
@View({
  directives: [NgIf],
  template: `
      <div class="view">
        <input class="toggle" type="checkbox" (click)="toggleCompletion()" [checked]="todo.completed">
        <label (dblclick)="editTodo()">{{todo.title}}</label>
        <button class="destroy" (click)="remove()"></button>
      </div>
      <input class="edit" *ng-if="todo.editing" [value]="todo.title" #editedtodo (blur)="stopEditing(editedtodo)" (keyup.enter)="updateEditingTodo(editedtodo)" (keyup.escape)="cancelEditingTodo()">`
})
export class TodoItem {

  private todo: Todo;

  constructor(@Inject(TodoStore) private todoStore: TodoStore) {
    this.todoStore = todoStore;
  }

  stopEditing(editedTitle) {
    this.todo.title = editedTitle.value;
    this.todo.editing = false;
  }

  cancelEditingTodo() {
    this.todo.editing = false;
  }

  updateEditingTodo(editedTitle) {
    editedTitle = editedTitle.value.trim();
    this.todo.editing = false;

    if (editedTitle.length === 0) {
      return this.todoStore.delete(this.todo.uid);
    }

    this.todo.title = editedTitle;
  }

  editTodo() {
    this.todo.editing = true;
  }
  
  // removeCompleted() {
  // 	this.todoStore.removeCompleted();
  // }
  
  // toggleCompletion() {
  // 	this.todoStore.toggleCompletion(this.todo.uid);
  // }
  
  remove() {
    this.todoStore.delete(this.todo.uid);
  }
}