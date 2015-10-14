import {Injectable} from 'angular2/angular2';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {UserActionType} from '../action-constants';
import {BackendMessagingService} from '../../channel/backend-messaging-service';

@Injectable()
export class UserActions {

  constructor(
    private dispatcher: Dispatcher,
    private messagingService: BackendMessagingService) {

  }

  getComponentData() {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.GET_COMPONENT_DATA
    });
    
    // This is not strictly needed for now. Just a broadcast that this was sent.
    // but we might want to listen to this in the future.
    // For example, (show indication that request has been sent on the UI)
    this.dispatcher.messageBus.onNext({
      actionType: UserActionType.GET_COMPONENT_DATA
    });
  }
}