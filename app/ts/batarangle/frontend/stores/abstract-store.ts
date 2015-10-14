import * as Rx from 'rx';

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
    this._dataStream.onNext(data);
  }

  protected emitError(error) {
    this._errorStream.onNext(error);
  }
}