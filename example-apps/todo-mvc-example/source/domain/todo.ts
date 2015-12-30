export class Todo {

  private static _ordinal = 0;

  private _completed: boolean;
  private _editing: boolean;
  private _title: string;
  private _uid: number;

  constructor(title: String) {
    this._uid = Todo._ordinal++;
    this._completed = false;
    this._editing = false;
    this._title = title.trim();
  }

  set title(title: String) {
    this._title = title.trim();
  }

  get title() {
    return this._title;
  }

  get editing() {
    return this._editing;
  }

  set editing(editing) {
    this._editing = editing;
  }

  get uid() {
    return this._uid;
  }

  get completed() {
    return this._completed;
  }

  set completed(completed) {
    this._completed = completed;
  }
}
