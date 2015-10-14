import {Injectable} from 'angular2/angular2';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType} from '../action-constants';

@Injectable()
export class BackendActions {

  constructor(private dispatcher: Dispatcher) {
  }

  componentDataChanged(componentData) {
    this.dispatcher.messageBus.onNext({
      actionType: BackendActionType.COMPONENT_DATA_CHANGED,
      componentData: componentData
    });
  }
}