import {Injectable, EventEmitter} from 'angular2/core';
import {Map} from 'immutable';
import {Todo} from '../domain/todo';

@Injectable()
export class TodoStore extends EventEmitter<Todo[]> {

  private _todos = Map<number, Todo>();

  public add(title: String) {
    let todo = new Todo(title);
    this._todos = this._todos.set(todo.uid, todo);
    this.emit(this._todos.toArray());
  }

  public update(todo: Todo) {
    this._todos = this._todos.update(todo.uid, () => todo);
     this.emit(this._todos.toArray());
  }

  public delete(uid: number) {
    this._todos = this._todos.delete(uid);
    this.emit(this._todos.toArray());
  }

  public get(uid?: number): Todo | Todo[] {
    if (uid === null) {
      return this._todos.toArray();
    } else {
      return this._todos.get(uid);
    }
  }

  get todos() {
    return this._todos.toArray();
  }
}
