export class TodoModel {
  status: String = 'started';
  constructor(
    public title: String = ''
  ) { }

  toggle() {
    if (this.status === 'started') {
      this.status = 'completed';
    } else {
      this.status = 'started';
    }
  }
}

export class TodoService {
  todos: TodoModel[] = [
    new TodoModel('one'),
    new TodoModel('two'),
    new TodoModel('three')
  ];

  addTodo(value: any): void {
    this.todos.push(value);
  }
}

export class FormatService {
  sayHello() {
    console.log('hello');
  }
}
