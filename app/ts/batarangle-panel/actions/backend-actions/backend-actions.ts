import {Injectable} from 'angular2/angular2';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {ActionType} from '../action-constants';

@Injectable()
export class BackendActions {

  constructor(private dispatcher: Dispatcher) {
  }

  rootFound() {
    this.dispatcher.messageBus.onNext({
      actionType: ActionType.ROOT_FOUND
    });
  }
}