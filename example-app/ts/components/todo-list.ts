import {Component, View, NgIf, NgFor, Inject} from 'angular2/angular2';
import {TodoStore} from '../stores/todo-store';
import {TodoItem} from './todo-item';

@Component({
  selector: 'todo-list',
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
				<input class="toggle-all" type="checkbox" *ng-if="todoStore.todos.length" #toggleall [checked]="todoStore.allCompleted()" (click)="todoStore.setAllTo(toggleall)">
				<ul class="todo-list">
					<li *ng-for="#todo of todoStore.todos" [class.completed]="todo.completed" [class.editing]="todo.editing">
					   <todo-item [todo]="todo" ></todo-item>
          </li>
				</ul>
			</section>
			<footer class="footer" *ng-if="todoStore.todos.length > 0">
				<span class="todo-count"><strong>{{todoStore.getRemaining().length}}</strong> {{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left</span>
				<button class="clear-completed" *ng-if="todoStore.getCompleted().length > 0" (click)="removeCompleted()">Clear completed</button>
			</footer>
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