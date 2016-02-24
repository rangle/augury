import {ReplaySubject} from 'rxjs';

export abstract class AbstractStore {

  protected _dataStream: ReplaySubject<any>;
  protected _errorStream: ReplaySubject<any>;

  constructor() {
    this._dataStream = new ReplaySubject(1);
    this._errorStream = new ReplaySubject(1);
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
