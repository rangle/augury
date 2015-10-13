import * as uuid from 'node-uuid';

export class Todo {
  
	private _completed: boolean;
	private _editing: boolean;
	private _title: string;
	private _uid: string;
  
  constructor(title: String) {
		this._uid = uuid.v4();
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
  
  get uid() {
    return this._uid;
  }
  
  get completed() {
    return this._completed;
  }
}