import {Subject} from '@reactivex/rxjs';

export class Dispatcher {

  private _messageBus: Subject<any>;

  constructor() {
    this._messageBus = new Subject<any>();
  }

  onAction(actionType, next: (action: any) => void) {
    this._messageBus.filter(
      action => action.actionType === actionType).subscribe(next);
  }

  get messageBus() {
    return this._messageBus;
  }
}
