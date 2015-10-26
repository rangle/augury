import * as Rx from '@reactiveX/rxjs';

export abstract class AbstractStore {

  protected _dataStream: Rx.ReplaySubject<any>;
  protected _errorStream: Rx.ReplaySubject<any>;

  constructor() {
    this._dataStream = new Rx.ReplaySubject(1);
    this._errorStream = new Rx.ReplaySubject(1);
  }

  get dataStream() {
    return this._dataStream;
  }

  get errorStream() {
    return this._errorStream;
  }

  protected emitChange(data) {
    this._dataStream.next(data);
  }

  protected emitError(error) {
    this._errorStream.next(error);
  }
}