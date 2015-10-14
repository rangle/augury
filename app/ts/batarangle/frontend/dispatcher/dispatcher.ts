import * as Rx from 'rx';

export class Dispatcher {

  private _messageBus: Rx.Subject<any>;

  constructor() {
    this._messageBus = new Rx.Subject<any>();
  }

  onAction(actionType, onNext: (action: any) => void) {
    this._messageBus.filter(
      action => action.actionType === actionType).subscribe(onNext);
  }

  get messageBus() {
    return this._messageBus;
  }
}