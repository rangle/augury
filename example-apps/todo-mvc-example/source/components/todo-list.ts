import {Component, View, Inject, OnInit, OnDestroy } from 'angular2/core';
import {NgIf, NgFor} from 'angular2/common';
import {TodoStore} from '../stores/todo-store';
import {TodoItem} from './todo-item';
import {Todo} from '../domain/todo';
import {Subscription} from 'rxjs';

@Component({
  selector: 'todo-list'
})
@View({
  directives: [NgIf, NgFor, TodoItem],
  template: `
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input class="new-todo"
          placeholder="What needs to be done?"
          autofocus=""
          (keyup)="addTodo($event)">
      </header>
      <section class="main" *ngIf="todoStore.todos.length > 0">
        <ul class="todo-list">
          <li *ngFor="#todo of todos"
            [class.completed]="todo.completed"
            [class.editing]="todo.editing">
              <todo-item [todo]="todo"></todo-item>
          </li>
        </ul>
      </section>
    </section>`
})
export class TodoList implements OnInit, OnDestroy {
  public todos: Todo[] = [];
  private _subscription: Subscription<Todo[]>;

  constructor(private todoStore: TodoStore) {
  }

  addTodo($event) {
    if ($event.which === 13 && $event.target.value.trim().length) {
      this.todoStore.add($event.target.value);
      $event.target.value = '';
    }
  }

  private onDataUpdated = (todos) => {
    // Maintain a stable array for ngFor while allowing todoStore to
    // protect its content from unexpected mutation.
    this.todos.splice(0, this.todos.length, ...todos);
  };

  ngOnInit() {
    this._subscription = this.todoStore.subscribe(this.onDataUpdated);
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
