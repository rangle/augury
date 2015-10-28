import * as Rx from '@reactiveX/rxjs';

export class Dispatcher {

  private _messageBus: Rx.Subject<any>;

  constructor() {
    this._messageBus = new Rx.Subject<any>();
  }

  onAction(actionType, next: (action: any) => void) {
    this._messageBus.filter(
      action => action.actionType === actionType).subscribe(next);
  }

  get messageBus() {
    return this._messageBus;
  }
}