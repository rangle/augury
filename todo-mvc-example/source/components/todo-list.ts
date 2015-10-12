import {Component, View, NgIf, NgFor, Inject} from 'angular2/angular2';
import {TodoStore} from '../stores/todo-store';
import {TodoItem} from './todo-item';

@Component({
  selector: 'todo-list'
})
@View({
  directives: [NgIf, NgFor, TodoItem],
  template: `
		<section class="todoapp">
      <header class="header">
				<h1>todos</h1>
				<input class="new-todo" placeholder="What needs to be done?" autofocus=""
        #newtodo (keyup)="addTodo($event, newtodo)">
			</header>
			<section class="main" *ng-if="todoStore.todos.length > 0">
				<ul class="todo-list">
					<li *ng-for="#todo of todoStore.todos" [class.completed]="todo.completed" [class.editing]="todo.editing">
					   <todo-item [todo]="todo" ></todo-item>
          </li>
				</ul>
			</section>
		</section>`
})
export class TodoList {

  constructor(@Inject(TodoStore) private todoStore: TodoStore) {
    this.todoStore = todoStore;
  }

  removeCompleted() {
    //this.todoStore.removeCompleted();
  }

  addTodo($event, newtodo) {
    if ($event.which === 13 && newtodo.value.trim().length) {
      this.todoStore.add(newtodo.value);
      newtodo.value = '';
    }
  }
}