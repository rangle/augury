import {Injectable} from 'angular2/angular2';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType} from '../action-constants';

@Injectable()
/**
 * Backend Actions
 */
export class BackendActions {

  constructor(
    private dispatcher: Dispatcher
  ) {
  }

  /**
   * Component Data Changed
   * @param  {Array} componentData
   */
  componentDataChanged(componentData) {

    console.log('BackendActions', componentData);
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.COMPONENT_DATA_CHANGED,
      componentData: componentData
    });

  }

}