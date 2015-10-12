import {Injectable} from 'angular2/angular2';
import {Map} from 'immutable';
import {Todo} from '../domain/todo';

@Injectable()
export class TodoStore {

  private _todos: Map<String, Todo>;

  constructor() {
    this._todos = Map<String, Todo>();
  }

  public add(title: String) {
    let todo = new Todo(title);
    return this._todos = this._todos.set(todo.uid, todo);
  }

  public update(todo: Todo) {
    this._todos = this._todos.update(todo.uid, () => todo);
  }
  
  public delete(uid: string) {
    this._todos = this._todos.delete(uid);
  }

  public get(uid?: String): Todo | Todo[] {
    if (uid === null) {
      return this._todos.toArray();
    }
    else {
      return this._todos.get(uid);
    }
  }
  
  get todos() {
    return this._todos.toArray();
  }
}
